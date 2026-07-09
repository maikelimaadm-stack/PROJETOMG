import { createEmpresasTableFormShadow } from '../shadow/pilots/empresasTableFormShadow.js';
import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../shadow/pilots/tableFormProjection.js';
import { createPreviewModel } from './previewModel.js';
import { ControlledPreviewError } from './errors.js';

const MODULE_ID = 'empresas';

/** Env flag that opts the preview in when no explicit `enabled` option is passed. Off unless exactly "true". */
const ENABLE_ENV_VAR = 'MAK_RUNTIME_V2_EMPRESAS_CONTROLLED_PREVIEW';

const MAX_DIAGNOSTICS = 500;

/** @param {string} code @param {string} message */
function previewError(code, message) {
  return new ControlledPreviewError(/** @type {any} */ (code), message);
}

let idCounter = 1;

/**
 * Empresas Controlled Preview Sandbox (post-Foundation C).
 *
 * Transforms the runtime v2 table/form projection of the Empresas module into
 * an isolated, plain-object PREVIEW MODEL — for validation and diagnostics
 * only. It never mounts a real preview, never renders into the production DOM,
 * never creates a public route, never executes an action/workflow/connector,
 * never saves data, never calls the backend. It is opt-in and disable-safe:
 * off by default, a no-op `{ skipped: true }` when off, and any projection
 * failure is captured, never propagated to the Empresas screen.
 */
export class ControlledPreview {
  /**
   * @param {Object} [options]
   * @param {boolean} [options.enabled] Explicit opt-in. When omitted, reads `MAK_RUNTIME_V2_EMPRESAS_CONTROLLED_PREVIEW` (off unless "true").
   * @param {() => number} [options.clock]
   * @param {object} [options.tableFormShadow] Injectable EmpresasTableFormShadow (for the projection).
   * @param {{ can?: Function }} [options.permissionEngine]
   * @param {{ describeFieldRules?: Function }} [options.validationEngine]
   * @param {{ recordEvent?: Function, recordMetric?: Function, captureError?: Function }} [options.observability]
   * @param {unknown} [options.context]
   */
  constructor(options = {}) {
    const { enabled, clock = () => Date.now(), tableFormShadow, permissionEngine, validationEngine, observability, context } = options;

    if (typeof clock !== 'function') {
      throw previewError('MAK-L3-PREVIEW-002', 'ControlledPreview "clock" option must be a function');
    }

    this._clock = clock;
    this._enabled = enabled === undefined ? readEnvFlag() : Boolean(enabled);
    this._observability = observability ?? null;
    this._tableFormShadow = tableFormShadow ?? createEmpresasTableFormShadow({
      enabled: true, // the preview's own flag gates execution; the projection layer must be live when it does run
      clock: this._clock,
      permissionEngine,
      validationEngine,
      observability: this._observability,
      context,
    });

    /** @type {Array<{id: string, ok: boolean, detail: unknown, timestamp: number}>} */
    this._records = [];
    this._runCount = 0;
    this._failureCount = 0;
  }

  /** @returns {boolean} */
  isEnabled() {
    return this._enabled;
  }

  /**
   * Builds a preview model from an already-computed table/form projection.
   * Pure and deterministic. Never renders, never executes anything.
   * @param {import('../types/shadow-table-form.js').TableFormProjectionResult} tableFormProjection
   * @param {{ differences?: Array<{path: string}> }} [options]
   * @returns {import('../types/preview.js').PreviewModel}
   */
  createPreviewModel(tableFormProjection, options) {
    return createPreviewModel(tableFormProjection, options);
  }

  /**
   * Runs one controlled preview: builds the runtime v2 projection (via the
   * table/form shadow) from the given descriptor input, transforms it into a
   * preview model, records diagnostics. Disabled → `{ skipped: true }`. A
   * projection failure is captured in the report, never propagated.
   * @param {import('../types/shadow-table-form.js').TableFormDescriptor} [input]
   * @returns {Promise<import('../types/preview.js').ControlledPreviewReport>}
   */
  async run(input) {
    // structural — throws on prototype pollution/depth. The shared helper carries the shadow-pilot
    // code string, so remap it to the preview's own MAK-L3-PREVIEW-001 while keeping the message.
    validateProjectionInput(input, 0, 'Controlled preview input', (_code, message) => previewError('MAK-L3-PREVIEW-001', message));

    if (!this._enabled) {
      return { skipped: true, moduleId: MODULE_ID, reason: 'controlled preview disabled', timestamp: this._clock() };
    }

    try {
      const projectionReport = await this._tableFormShadow.run(input);
      if (projectionReport.skipped) {
        throw previewError('MAK-L3-PREVIEW-002', 'table/form shadow returned skipped — cannot build preview');
      }
      if (projectionReport.ok === false) {
        // The projection captured its own failure — surface it as a captured preview failure.
        const err = projectionReport.error ?? { name: 'Error', message: 'projection failed' };
        this._failureCount += 1;
        this._pushRecord(false, err);
        return { skipped: false, ok: false, moduleId: MODULE_ID, error: err, timestamp: this._clock() };
      }

      const differences = projectionReport.comparison?.differences ?? [];
      const previewModel = createPreviewModel(projectionReport.runtimeProjection, { differences });

      this._runCount += 1;
      this._emitMetric('preview.empresas.warnings', previewModel.diagnostics.warnings.length);
      this._pushRecord(true, {
        columns: previewModel.table.columns.length,
        fields: previewModel.form.fields.length,
        warnings: previewModel.diagnostics.warnings.length,
        deniedFields: previewModel.diagnostics.deniedFields.length,
      });
      return { skipped: false, ok: true, moduleId: MODULE_ID, previewModel, timestamp: this._clock() };
    } catch (err) {
      // Projection/preview failure is isolated here — never rethrown toward the Empresas UI.
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
   * @returns {import('../types/shadow-pilot.js').EmpresasShadowPilotDiagnostics}
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

  /** Resets the diagnostics buffer and counters. */
  clear() {
    this._records = [];
    this._runCount = 0;
    this._failureCount = 0;
  }

  // --- internals ---

  /** @param {boolean} ok @param {unknown} detail */
  _pushRecord(ok, detail) {
    if (this._records.length >= MAX_DIAGNOSTICS) {
      throw previewError('MAK-L3-PREVIEW-002', `Too many diagnostic records (> ${MAX_DIAGNOSTICS})`);
    }
    this._records.push({
      id: `empresas-preview-${idCounter++}`,
      ok,
      detail: redactSensitive(safeClone(detail)),
      timestamp: this._clock(),
    });
  }

  /** @param {string} name @param {number} value */
  _emitMetric(name, value) {
    if (this._observability && typeof this._observability.recordMetric === 'function') {
      try {
        this._observability.recordMetric(name, value, { source: 'empresas-controlled-preview' });
      } catch {
        // Observability failure must never break the preview.
      }
    }
  }

  /** @param {unknown} err */
  _captureError(err) {
    if (this._observability && typeof this._observability.captureError === 'function') {
      try {
        this._observability.captureError(err, { source: 'empresas-controlled-preview' });
      } catch {
        // ignore
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
 * @param {ConstructorParameters<typeof ControlledPreview>[0]} [options]
 * @returns {ControlledPreview}
 */
export function createControlledPreview(options) {
  return new ControlledPreview(options);
}

export { createPreviewModel, ControlledPreviewError };
