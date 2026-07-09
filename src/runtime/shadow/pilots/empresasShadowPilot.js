import { createRuntimeShadowMode } from '../runtimeShadowMode.js';
import { EmpresasShadowPilotError } from './errors.js';

const MODULE_ID = 'empresas';

/** Env flag that opts the pilot in when no explicit `enabled` option is passed. Off unless exactly "true". */
const ENABLE_ENV_VAR = 'MAK_RUNTIME_V2_SHADOW_EMPRESAS';

const MAX_INPUT_DEPTH = 8;
const MAX_DIAGNOSTICS = 500;
const BLOCKED_KEYS = new Set(['__proto__', 'constructor', 'prototype']);
const SENSITIVE_KEY_PATTERN = /password|token|secret|api[-_]?key|authorization|cookie|credential/i;

/**
 * Canonical, decoupled structural descriptor of the Empresas module. The
 * runtime never imports the production `src/modules/empresas/*` UI config
 * (that would invert the layering); instead this passive descriptor mirrors
 * the module's known structure and can be overridden by caller-supplied
 * `input` (e.g. a future passive UI hook handing over the live field defs).
 * @type {import('../../types/shadow-pilot.js').EmpresasModuleDescriptor}
 */
const EMPRESAS_DEFAULT_DESCRIPTOR = {
  moduleId: MODULE_ID,
  entityName: 'EmpresaCadastro',
  fields: [
    { id: 'tipo_pessoa', type: 'select', required: true },
    { id: 'tipo_vinculo', type: 'select', required: false },
    { id: 'codempresa', type: 'text', required: false },
    { id: 'razao_social', type: 'text', required: true },
    { id: 'status', type: 'select', required: false },
    { id: 'nome_fantasia', type: 'text', required: false },
    { id: 'cpf_cnpj', type: 'cpf_cnpj', required: false },
    { id: 'inscricao_estadual', type: 'text', required: false },
    { id: 'telefone', type: 'tel', required: false },
    { id: 'whatsapp', type: 'tel', required: false },
  ],
  requiredFields: ['razao_social', 'tipo_pessoa'],
};

/** Runtime v2 canonicalizes a few field types — the drift this pilot is meant to surface. */
const V2_TYPE_MAP = { tel: 'phone', cpf_cnpj: 'document', text: 'string' };

/** @param {unknown} value */
function isPlainObject(value) {
  return typeof value === 'object' && value !== null && !Array.isArray(value) && !(value instanceof Date);
}

/**
 * @param {unknown} value
 * @param {number} depth
 * @param {string} label
 */
function validateShape(value, depth, label) {
  if (depth > MAX_INPUT_DEPTH) {
    throw new EmpresasShadowPilotError('MAK-L3-SHADOW-PILOT-001', `${label} exceeds maximum depth (${MAX_INPUT_DEPTH})`);
  }
  if (Array.isArray(value)) {
    for (const item of value) validateShape(item, depth + 1, label);
    return;
  }
  if (isPlainObject(value)) {
    for (const key of Object.keys(value)) {
      if (BLOCKED_KEYS.has(key)) {
        throw new EmpresasShadowPilotError('MAK-L3-SHADOW-PILOT-001', `${label} contains a forbidden key: "${key}"`);
      }
      validateShape(/** @type {Record<string, unknown>} */ (value)[key], depth + 1, label);
    }
  }
}

/** @param {unknown} value @param {number} [depth] */
function redactSensitive(value, depth = 0) {
  if (depth > MAX_INPUT_DEPTH) return '[TRUNCATED]';
  if (Array.isArray(value)) return value.map((v) => redactSensitive(v, depth + 1));
  if (isPlainObject(value)) {
    /** @type {Record<string, unknown>} */
    const out = {};
    for (const [key, v] of Object.entries(value)) {
      out[key] = SENSITIVE_KEY_PATTERN.test(key) ? '[REDACTED]' : redactSensitive(v, depth + 1);
    }
    return out;
  }
  return value;
}

/** @param {unknown} value */
function safeClone(value) {
  if (value === undefined) return undefined;
  try {
    return JSON.parse(JSON.stringify(value));
  } catch {
    return String(value);
  }
}

/** @param {import('../../types/shadow-pilot.js').EmpresasFieldDescriptor[]} fields */
function normalizeFields(fields, typeMap) {
  return [...fields]
    .map((f) => ({ id: String(f.id), type: typeMap[f.type] ?? f.type, required: Boolean(f.required) }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

let idCounter = 1;

/**
 * Empresas Runtime v2 Shadow Pilot (post-Foundation C).
 *
 * The first real, passive, opt-in integration between a production module
 * (Empresas / CadastroEmpresas) and runtime v2. It builds a structural
 * snapshot of the module as the legacy runtime sees it and as runtime v2
 * would normalize it, compares them through `RuntimeShadowMode`, and records
 * diagnostics — without ever rendering UI, touching real data, running
 * save/edit/delete, or invoking an action/workflow/connector. It is opt-in:
 * disabled by default, a no-op `{ skipped: true }` when off, and a shadow
 * failure is always captured, never propagated to the Empresas screen.
 */
export class EmpresasShadowPilot {
  /**
   * @param {Object} [options]
   * @param {boolean} [options.enabled] Explicit opt-in. When omitted, reads `MAK_RUNTIME_V2_SHADOW_EMPRESAS` (off unless "true").
   * @param {() => number} [options.clock]
   * @param {import('../../types/shadow-pilot.js').EmpresasModuleDescriptor} [options.descriptor] Overrides the default Empresas descriptor.
   * @param {object} [options.shadowMode] Injectable RuntimeShadowMode (for testing / custom wiring).
   * @param {{ recordEvent?: Function, recordMetric?: Function, captureError?: Function }} [options.observability]
   * @param {{ checkRuntimeCompleteness?: Function }} [options.completion]
   * @param {() => (Promise<unknown>|unknown)} [options.loadRuntimeV2] Builds a runtime v2 result for readiness during the pass.
   */
  constructor(options = {}) {
    const {
      enabled,
      clock = () => Date.now(),
      descriptor,
      shadowMode,
      observability,
      completion,
      loadRuntimeV2,
    } = options;

    if (typeof clock !== 'function') {
      throw new EmpresasShadowPilotError('MAK-L3-SHADOW-PILOT-002', 'EmpresasShadowPilot "clock" option must be a function');
    }
    if (descriptor !== undefined && !isPlainObject(descriptor)) {
      throw new EmpresasShadowPilotError('MAK-L3-SHADOW-PILOT-002', 'EmpresasShadowPilot "descriptor" option must be an object');
    }

    this._clock = clock;
    this._enabled = enabled === undefined ? readEnvFlag() : Boolean(enabled);
    this._descriptor = descriptor ? { ...EMPRESAS_DEFAULT_DESCRIPTOR, ...descriptor } : EMPRESAS_DEFAULT_DESCRIPTOR;
    this._observability = observability ?? null;
    this._completion = completion ?? null;

    this._shadowMode = shadowMode ?? createRuntimeShadowMode({
      enabled: true, // the pilot's own flag gates execution; the shadow layer must be live when it does run
      clock: this._clock,
      observability: this._observability,
      completion: this._completion,
      loadRuntime: loadRuntimeV2 ?? (() => ({ moduleId: MODULE_ID, registry: {} })),
    });

    /** @type {import('../../types/shadow-pilot.js').EmpresasShadowPilotDiagnostics['records']} */
    this._records = [];
    this._runCount = 0;
    this._failureCount = 0;
  }

  /** @returns {boolean} */
  isEnabled() {
    return this._enabled;
  }

  /**
   * Structural snapshot of Empresas as the LEGACY runtime represents it —
   * raw field types preserved. Deterministic (fields sorted by id).
   * @param {import('../../types/shadow-pilot.js').EmpresasModuleDescriptor} [input]
   * @returns {import('../../types/shadow-pilot.js').EmpresasStructuralSnapshot}
   */
  createLegacySnapshot(input) {
    const descriptor = this._resolveDescriptor(input);
    return {
      moduleId: descriptor.moduleId,
      entityName: descriptor.entityName,
      fieldCount: descriptor.fields.length,
      fields: normalizeFields(descriptor.fields, {}),
      requiredFields: [...descriptor.requiredFields].sort(),
      meta: /** @type {Record<string, unknown>} */ (redactSensitive(safeClone(descriptor.meta ?? {}))),
    };
  }

  /**
   * Structural snapshot of Empresas as RUNTIME V2 would normalize it —
   * canonical field types applied. Deterministic (fields sorted by id).
   * @param {import('../../types/shadow-pilot.js').EmpresasModuleDescriptor} [input]
   * @returns {import('../../types/shadow-pilot.js').EmpresasStructuralSnapshot}
   */
  createRuntimeV2Input(input) {
    const descriptor = this._resolveDescriptor(input);
    return {
      moduleId: descriptor.moduleId,
      entityName: descriptor.entityName,
      fieldCount: descriptor.fields.length,
      fields: normalizeFields(descriptor.fields, V2_TYPE_MAP),
      requiredFields: [...descriptor.requiredFields].sort(),
      meta: /** @type {Record<string, unknown>} */ (redactSensitive(safeClone(descriptor.meta ?? {}))),
    };
  }

  /**
   * Runs one passive Empresas shadow diagnostic: builds both structural
   * snapshots, compares them via RuntimeShadowMode, runs a shadow pass for
   * readiness, records diagnostics. Disabled → `{ skipped: true }`. Any
   * internal/shadow failure is captured in the report, never propagated.
   * @param {import('../../types/shadow-pilot.js').EmpresasModuleDescriptor} [input]
   * @returns {Promise<import('../../types/shadow-pilot.js').EmpresasShadowPilotReport>}
   */
  async run(input) {
    validateShape(input, 0, 'Empresas shadow pilot input'); // structural — throws on pollution/depth

    if (!this._enabled) {
      return { skipped: true, moduleId: MODULE_ID, reason: 'empresas shadow pilot disabled', timestamp: this._clock() };
    }

    try {
      const legacySnapshot = this.createLegacySnapshot(input);
      const v2Snapshot = this.createRuntimeV2Input(input);
      const comparison = this._shadowMode.compareWithLegacy(legacySnapshot, v2Snapshot);
      const pass = await this._shadowMode.runShadowPass({ moduleId: MODULE_ID });

      this._runCount += 1;
      this._pushRecord(true, {
        equivalent: comparison.equivalent,
        differences: comparison.differences.length,
        passSuccess: pass.success ?? null,
      });
      return {
        skipped: false,
        ok: true,
        moduleId: MODULE_ID,
        equivalent: comparison.equivalent,
        comparison,
        readiness: pass.readiness ?? null,
        passSuccess: pass.success ?? null,
        timestamp: this._clock(),
      };
    } catch (err) {
      // Shadow/internal failure is isolated here — never rethrown toward the Empresas UI.
      this._failureCount += 1;
      const normalized = {
        name: err instanceof Error ? err.name : 'Error',
        message: err instanceof Error ? err.message : String(err),
      };
      this._captureError(err);
      this._pushRecord(false, normalized);
      return { skipped: false, ok: false, moduleId: MODULE_ID, error: normalized, timestamp: this._clock() };
    }
  }

  /**
   * Deep, independent copy of the pilot's diagnostics — mutating it can never
   * reach back into internal state.
   * @returns {import('../../types/shadow-pilot.js').EmpresasShadowPilotDiagnostics}
   */
  getDiagnostics() {
    return {
      enabled: this._enabled,
      moduleId: MODULE_ID,
      runCount: this._runCount,
      failureCount: this._failureCount,
      records: this._records.map((r) => safeClone(r)),
    };
  }

  /** Resets the diagnostics buffer and counters (safe off switch / testing). */
  clear() {
    this._records = [];
    this._runCount = 0;
    this._failureCount = 0;
  }

  // --- internals ---

  /** @param {unknown} input */
  _resolveDescriptor(input) {
    if (input === undefined || input === null) return this._descriptor;
    if (!isPlainObject(input)) {
      throw new EmpresasShadowPilotError('MAK-L3-SHADOW-PILOT-001', 'Empresas descriptor input must be a plain object');
    }
    validateShape(input, 0, 'Empresas descriptor input');
    const merged = { ...this._descriptor, ...input };
    return {
      moduleId: String(merged.moduleId ?? MODULE_ID),
      entityName: String(merged.entityName ?? this._descriptor.entityName),
      fields: Array.isArray(merged.fields) ? merged.fields : this._descriptor.fields,
      requiredFields: Array.isArray(merged.requiredFields) ? merged.requiredFields : this._descriptor.requiredFields,
      meta: isPlainObject(merged.meta) ? merged.meta : undefined,
    };
  }

  /** @param {boolean} ok @param {unknown} detail */
  _pushRecord(ok, detail) {
    if (this._records.length >= MAX_DIAGNOSTICS) {
      throw new EmpresasShadowPilotError('MAK-L3-SHADOW-PILOT-002', `Too many diagnostic records (> ${MAX_DIAGNOSTICS})`);
    }
    this._records.push({
      id: `empresas-shadow-${idCounter++}`,
      ok,
      detail: redactSensitive(safeClone(detail)),
      timestamp: this._clock(),
    });
  }

  /** @param {unknown} err */
  _captureError(err) {
    if (this._observability && typeof this._observability.captureError === 'function') {
      try {
        this._observability.captureError(err, { source: 'empresas-shadow-pilot' });
      } catch {
        // Observability failure must never break the pilot.
      }
    }
  }
}

/** @returns {boolean} */
function readEnvFlag() {
  try {
    return typeof process !== 'undefined' && process?.env?.[ENABLE_ENV_VAR] === 'true';
  } catch {
    return false;
  }
}

/**
 * @param {ConstructorParameters<typeof EmpresasShadowPilot>[0]} [options]
 * @returns {EmpresasShadowPilot}
 */
export function createEmpresasShadowPilot(options) {
  return new EmpresasShadowPilot(options);
}

export { EmpresasShadowPilotError, EMPRESAS_DEFAULT_DESCRIPTOR };
