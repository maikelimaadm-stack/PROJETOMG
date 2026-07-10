import { createRuntimeShadowMode } from '../runtimeShadowMode.js';
import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../pilots/tableFormProjection.js';
import { GenericModuleShadowError } from './errors.js';
import { normalizeGenericModuleDescriptor } from './genericModuleDescriptor.js';

const DEFAULT_FLAG = 'MAK_RUNTIME_V2_SECOND_MODULE_SHADOW';
const MAX_DIAGNOSTICS = 500;
const V2_TYPE_MAP = { tel: 'phone', cpf_cnpj: 'document', text: 'string' };

/** @param {string} code @param {string} message */
function genericError(code, message) {
  return new GenericModuleShadowError(/** @type {any} */ (code), message);
}

/** @param {import('../../types/shadow-table-form.js').TableFormFieldDescriptor[]} fields @param {Record<string,string>} typeMap */
function normalizeFields(fields, typeMap) {
  return [...(Array.isArray(fields) ? fields : [])]
    .map((f) => ({ id: String(f.id), type: typeMap[f.type] ?? f.type, required: Boolean(f.required) }))
    .sort((a, b) => a.id.localeCompare(b.id));
}

let idCounter = 1;

/**
 * Generic, module-agnostic shadow pilot — the Empresas shadow pilot
 * generalized. It builds a structural snapshot of any validated
 * `GenericModuleDescriptor` as the legacy runtime represents it and as runtime
 * v2 would normalize it, compares them via RuntimeShadowMode, and records
 * diagnostics — without rendering UI, executing behavior, touching data, or
 * calling the backend.
 */
export class GenericModuleShadowPilot {
  /**
   * @param {Object} options
   * @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} options.descriptor Required.
   * @param {boolean} [options.enabled]
   * @param {string} [options.envFlag]
   * @param {() => number} [options.clock]
   * @param {object} [options.shadowMode]
   * @param {{ recordEvent?: Function, recordMetric?: Function, captureError?: Function }} [options.observability]
   * @param {{ checkRuntimeCompleteness?: Function }} [options.completion]
   */
  constructor(options = {}) {
    const { descriptor, enabled, envFlag = DEFAULT_FLAG, clock = () => Date.now(), shadowMode, observability, completion } = options;
    if (typeof clock !== 'function') {
      throw genericError('MAK-L3-GENERIC-SHADOW-002', 'GenericModuleShadowPilot "clock" option must be a function');
    }
    this._descriptor = normalizeGenericModuleDescriptor(descriptor);
    this._moduleId = this._descriptor.moduleId;
    this._clock = clock;
    this._observability = observability ?? null;
    this._completion = completion ?? null;
    this._enabled = enabled === undefined ? readEnvFlag(envFlag) : Boolean(enabled);
    this._shadowMode = shadowMode ?? createRuntimeShadowMode({
      enabled: true,
      clock: this._clock,
      observability: this._observability,
      completion: this._completion,
      loadRuntime: () => ({ moduleId: this._moduleId, registry: {} }),
    });

    /** @type {import('../../types/generic-module-shadow.js').GenericModuleDiagnostics['records']} */
    this._records = [];
    this._runCount = 0;
    this._failureCount = 0;
  }

  /** @returns {boolean} */
  isEnabled() {
    return this._enabled;
  }

  /** @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} [input] */
  createLegacySnapshot(input) {
    const d = this._resolveDescriptor(input);
    return this._snapshot(d, {}, 'legacy');
  }

  /** @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} [input] */
  createRuntimeV2Input(input) {
    const d = this._resolveDescriptor(input);
    return this._snapshot(d, V2_TYPE_MAP, 'v2');
  }

  /**
   * @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} [input]
   * @returns {Promise<import('../../types/generic-module-shadow.js').GenericModuleShadowReport>}
   */
  async run(input) {
    validateProjectionInput(input, 0, 'Generic shadow pilot input', (_c, message) => genericError('MAK-L3-GENERIC-SHADOW-001', message));

    if (!this._enabled) {
      return { skipped: true, moduleId: this._moduleId, reason: `${this._moduleId} shadow pilot disabled`, timestamp: this._clock() };
    }

    try {
      const legacySnapshot = this.createLegacySnapshot(input);
      const v2Snapshot = this.createRuntimeV2Input(input);
      const comparison = this._shadowMode.compareWithLegacy(legacySnapshot, v2Snapshot);
      const pass = await this._shadowMode.runShadowPass({ moduleId: this._moduleId });

      this._runCount += 1;
      this._pushRecord(true, { equivalent: comparison.equivalent, differences: comparison.differences.length, passSuccess: pass.success ?? null });
      return {
        skipped: false,
        ok: true,
        moduleId: this._moduleId,
        equivalent: comparison.equivalent,
        comparison,
        readiness: pass.readiness ?? null,
        passSuccess: pass.success ?? null,
        timestamp: this._clock(),
      };
    } catch (err) {
      this._failureCount += 1;
      const normalized = { name: err instanceof Error ? err.name : 'Error', message: err instanceof Error ? err.message : String(err) };
      this._captureError(err);
      this._pushRecord(false, normalized);
      return { skipped: false, ok: false, moduleId: this._moduleId, error: normalized, timestamp: this._clock() };
    }
  }

  /** @returns {import('../../types/generic-module-shadow.js').GenericModuleDiagnostics} */
  getDiagnostics() {
    return {
      enabled: this._enabled,
      moduleId: this._moduleId,
      runCount: this._runCount,
      failureCount: this._failureCount,
      records: this._records.map((r) => safeClone(r)),
    };
  }

  /** Resets the diagnostics buffer and counters. */
  clear() {
    this._records = [];
    this._runCount = 0;
    this._failureCount = 0;
  }

  // --- internals ---

  /** @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} d @param {Record<string,string>} typeMap @param {'legacy'|'v2'} runtime */
  _snapshot(d, typeMap, runtime) {
    return {
      moduleId: d.moduleId,
      entityName: d.entityName,
      runtime,
      fieldCount: Array.isArray(d.fields) ? d.fields.length : 0,
      fields: normalizeFields(d.fields, typeMap),
      requiredFields: [...(d.requiredFields ?? [])].sort(),
      meta: /** @type {Record<string, unknown>} */ (redactSensitive(safeClone(d.meta ?? {}))),
    };
  }

  /** @param {unknown} input */
  _resolveDescriptor(input) {
    if (input === undefined || input === null) return this._descriptor;
    if (!isPlainObject(input)) {
      throw genericError('MAK-L3-GENERIC-SHADOW-001', 'Descriptor input must be a plain object');
    }
    validateProjectionInput(input, 0, 'Descriptor input', (_c, message) => genericError('MAK-L3-GENERIC-SHADOW-001', message));
    return { ...this._descriptor, ...input };
  }

  /** @param {boolean} ok @param {unknown} detail */
  _pushRecord(ok, detail) {
    if (this._records.length >= MAX_DIAGNOSTICS) {
      throw genericError('MAK-L3-GENERIC-SHADOW-002', `Too many diagnostic records (> ${MAX_DIAGNOSTICS})`);
    }
    this._records.push({ id: `${this._moduleId}-shadow-${idCounter++}`, ok, detail: redactSensitive(safeClone(detail)), timestamp: this._clock() });
  }

  /** @param {unknown} err */
  _captureError(err) {
    if (this._observability && typeof this._observability.captureError === 'function') {
      try { this._observability.captureError(err, { source: `${this._moduleId}-shadow-pilot` }); } catch { /* ignore */ }
    }
  }
}

/** @param {string} flag @returns {boolean} */
function readEnvFlag(flag) {
  try {
    return typeof process !== 'undefined' && process?.env?.[flag] === 'true';
  } catch {
    return false;
  }
}

/**
 * @param {ConstructorParameters<typeof GenericModuleShadowPilot>[0]} options
 * @returns {GenericModuleShadowPilot}
 */
export function createGenericModuleShadowPilot(options) {
  return new GenericModuleShadowPilot(options);
}

export { GenericModuleShadowError };
