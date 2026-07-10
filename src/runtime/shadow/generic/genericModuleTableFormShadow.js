import { createRuntimeShadowMode } from '../runtimeShadowMode.js';
import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
  createTableFormProjection,
} from '../pilots/tableFormProjection.js';
import { GenericModuleShadowError } from './errors.js';
import { normalizeGenericModuleDescriptor } from './genericModuleDescriptor.js';

const DEFAULT_FLAG = 'MAK_RUNTIME_V2_SECOND_MODULE_SHADOW';
const MAX_DIAGNOSTICS = 500;

/** Runtime v2 canonicalizes a few field types — the drift this projection surfaces. Same map as Empresas. */
const V2_TYPE_MAP = { tel: 'phone', cpf_cnpj: 'document', text: 'string' };

/** @param {string} code @param {string} message */
function genericError(code, message) {
  return new GenericModuleShadowError(/** @type {any} */ (code), message);
}

let idCounter = 1;

/**
 * Generic, module-agnostic table/form shadow projection. This is the Empresas
 * table/form shadow generalized: it takes any validated `GenericModuleDescriptor`
 * (Empresas, cadcps, or a future module) and produces the same intermediate
 * table/form projection + legacy-vs-runtime-v2 comparison — never rendering
 * real UI, never executing an action/workflow/connector, never touching data
 * or the backend.
 */
export class GenericModuleTableFormShadow {
  /**
   * @param {Object} options
   * @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} options.descriptor Required.
   * @param {boolean} [options.enabled]
   * @param {string} [options.envFlag] Per-module opt-in flag name (defaults to the shared second-module flag).
   * @param {() => number} [options.clock]
   * @param {object} [options.shadowMode]
   * @param {{ can?: Function }} [options.permissionEngine]
   * @param {{ describeFieldRules?: Function }} [options.validationEngine]
   * @param {{ registerAdapter?: Function }} [options.renderEngine]
   * @param {{ recordEvent?: Function, recordMetric?: Function, captureError?: Function }} [options.observability]
   * @param {unknown} [options.context]
   */
  constructor(options = {}) {
    const {
      descriptor,
      enabled,
      envFlag = DEFAULT_FLAG,
      clock = () => Date.now(),
      shadowMode,
      permissionEngine,
      validationEngine,
      renderEngine,
      observability,
      context,
    } = options;

    if (typeof clock !== 'function') {
      throw genericError('MAK-L3-GENERIC-SHADOW-002', 'GenericModuleTableFormShadow "clock" option must be a function');
    }
    // Validates + normalizes (throws GenericModuleShadowError on invalid descriptor / pollution).
    this._descriptor = normalizeGenericModuleDescriptor(descriptor);
    this._moduleId = this._descriptor.moduleId;
    this._envFlag = envFlag;
    this._clock = clock;
    this._permissionEngine = permissionEngine ?? null;
    this._validationEngine = validationEngine ?? null;
    this._renderEngine = renderEngine ?? null;
    this._observability = observability ?? null;
    this._context = context ?? {};
    this._enabled = enabled === undefined ? readEnvFlag(envFlag) : Boolean(enabled);
    this._shadowMode = shadowMode ?? createRuntimeShadowMode({ enabled: true, clock: this._clock, observability: this._observability });

    /** @type {import('../../types/generic-module-shadow.js').GenericModuleDiagnostics['records']} */
    this._records = [];
    this._runCount = 0;
    this._failureCount = 0;
  }

  /** @returns {boolean} */
  isEnabled() {
    return this._enabled;
  }

  /**
   * @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} [input]
   * @returns {Promise<import('../../types/shadow-table-form.js').TableFormProjectionResult>}
   */
  async createLegacyTableFormSnapshot(input) {
    return createTableFormProjection(this._resolveDescriptor(input), { runtime: 'legacy' });
  }

  /**
   * @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} [input]
   * @returns {Promise<import('../../types/shadow-table-form.js').TableFormProjectionResult>}
   */
  async createRuntimeV2TableFormProjection(input) {
    return createTableFormProjection(this._resolveDescriptor(input), {
      runtime: 'v2',
      typeMap: V2_TYPE_MAP,
      permissionEngine: this._permissionEngine ?? undefined,
      validationEngine: this._validationEngine ?? undefined,
      renderEngine: this._renderEngine ?? undefined,
      context: this._context,
    });
  }

  /**
   * @param {import('../../types/shadow-table-form.js').TableFormProjectionResult} legacySnapshot
   * @param {import('../../types/shadow-table-form.js').TableFormProjectionResult} runtimeProjection
   * @returns {import('../types/shadow.js').ShadowComparison}
   */
  compareTableForm(legacySnapshot, runtimeProjection) {
    return this._shadowMode.compareWithLegacy(stripMarker(legacySnapshot), stripMarker(runtimeProjection));
  }

  /**
   * @param {import('../../types/generic-module-shadow.js').GenericModuleDescriptor} [input]
   * @returns {Promise<import('../../types/shadow-table-form.js').EmpresasTableFormShadowReport>}
   */
  async run(input) {
    validateProjectionInput(input, 0, 'Generic table/form shadow input', (_c, message) => genericError('MAK-L3-GENERIC-SHADOW-001', message));

    if (!this._enabled) {
      return { skipped: true, moduleId: this._moduleId, reason: `${this._moduleId} table/form shadow disabled`, timestamp: this._clock() };
    }

    try {
      const legacySnapshot = await this.createLegacyTableFormSnapshot(input);
      const runtimeProjection = await this.createRuntimeV2TableFormProjection(input);
      const comparison = this.compareTableForm(legacySnapshot, runtimeProjection);

      this._runCount += 1;
      this._emitMetric(`shadow.${this._moduleId}_table_form.differences`, comparison.differences.length);
      this._pushRecord(true, { equivalent: comparison.equivalent, differences: comparison.differences.length });
      return {
        skipped: false,
        ok: true,
        moduleId: this._moduleId,
        equivalent: comparison.equivalent,
        comparison,
        legacySnapshot,
        runtimeProjection,
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
    this._records.push({ id: `${this._moduleId}-tableform-shadow-${idCounter++}`, ok, detail: redactSensitive(safeClone(detail)), timestamp: this._clock() });
  }

  /** @param {string} name @param {number} value */
  _emitMetric(name, value) {
    if (this._observability && typeof this._observability.recordMetric === 'function') {
      try { this._observability.recordMetric(name, value, { source: `${this._moduleId}-table-form-shadow` }); } catch { /* never break */ }
    }
  }

  /** @param {unknown} err */
  _captureError(err) {
    if (this._observability && typeof this._observability.captureError === 'function') {
      try { this._observability.captureError(err, { source: `${this._moduleId}-table-form-shadow` }); } catch { /* ignore */ }
    }
  }
}

/** @param {import('../../types/shadow-table-form.js').TableFormProjectionResult} projection */
function stripMarker(projection) {
  const { runtime, renderEngineWired, ...rest } = /** @type {any} */ (projection);
  return rest;
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
 * @param {ConstructorParameters<typeof GenericModuleTableFormShadow>[0]} options
 * @returns {GenericModuleTableFormShadow}
 */
export function createGenericModuleTableFormShadow(options) {
  return new GenericModuleTableFormShadow(options);
}

export { GenericModuleShadowError };
