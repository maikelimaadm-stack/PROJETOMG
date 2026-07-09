import { createRuntimeShadowMode } from '../runtimeShadowMode.js';
import { EmpresasShadowPilotError } from './errors.js';
import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
  createTableFormProjection,
} from './tableFormProjection.js';

const MODULE_ID = 'empresas';

/** Env flag that opts the projection in when no explicit `enabled` option is passed. Off unless exactly "true". */
const ENABLE_ENV_VAR = 'MAK_RUNTIME_V2_SHADOW_EMPRESAS_TABLE_FORM';

const MAX_DIAGNOSTICS = 500;

/** Runtime v2 canonicalizes a few field types — the drift this projection surfaces. */
const V2_TYPE_MAP = { tel: 'phone', cpf_cnpj: 'document', text: 'string' };

/**
 * Canonical, decoupled table/form descriptor of the Empresas module. As with
 * the Empresas Shadow Pilot, the runtime never imports the production
 * `src/modules/empresas/*` UI; this passive descriptor mirrors the module's
 * known table columns and form fields and can be overridden by caller-supplied
 * `input` (e.g. a future passive UI hook handing over the live definitions).
 * @type {import('../../types/shadow-table-form.js').TableFormDescriptor}
 */
const EMPRESAS_TABLE_FORM_DESCRIPTOR = {
  moduleId: MODULE_ID,
  entityName: 'EmpresaCadastro',
  fields: [
    { id: 'tipo_pessoa', label: 'Tipo de Pessoa', type: 'select', required: true, validation: { rules: ['required'] } },
    { id: 'razao_social', label: 'Nome/Razão Social', type: 'text', required: true, validation: { rules: ['required', 'uppercase'] } },
    { id: 'codempresa', label: 'Cód. Empresa', type: 'text', required: false },
    { id: 'cpf_cnpj', label: 'CPF/CNPJ', type: 'cpf_cnpj', required: false, validation: { rules: ['cpf_cnpj'] } },
    { id: 'status', label: 'Ativa', type: 'select', required: false },
    { id: 'telefone', label: 'Telefone', type: 'tel', required: false },
    { id: 'inscricao_estadual', label: 'Inscrição Estadual', type: 'text', required: false, permission: 'empresas.view_fiscal' },
  ],
  table: {
    columns: [
      { id: 'codempresa', label: 'Cód.', sortable: true, filterable: true, visible: true },
      { id: 'razao_social', label: 'Razão Social', sortable: true, filterable: true, visible: true },
      { id: 'cpf_cnpj', label: 'CPF/CNPJ', sortable: false, filterable: true, visible: true },
      { id: 'status', label: 'Ativa', sortable: true, filterable: true, visible: true },
      { id: 'inscricao_estadual', label: 'IE', sortable: false, filterable: false, visible: false },
    ],
    actions: [
      { id: 'empresa.create', kind: 'action', ref: 'empresa_create' },
      { id: 'empresa.edit', kind: 'action', ref: 'empresa_edit' },
    ],
  },
  form: {
    actions: [{ id: 'empresa.save', kind: 'action', ref: 'empresa_save' }],
    workflows: [{ id: 'empresa.approval', ref: 'empresa_approval' }],
  },
  requiredFields: ['razao_social', 'tipo_pessoa'],
};

/** @param {string} code @param {string} message */
function pilotError(code, message) {
  return new EmpresasShadowPilotError(/** @type {any} */ (code), message);
}

let idCounter = 1;

/**
 * Empresas Table/Form Shadow Projection (post-Foundation C).
 *
 * Produces an INTERMEDIATE runtime v2 representation of the Empresas table
 * and form — columns, fields, validation metadata, permission metadata, and
 * actions/workflows as metadata only — and compares it against a legacy
 * structural snapshot, generating divergence diagnostics. It never renders
 * real UI (no DOM/React), never executes an action/workflow/connector, never
 * touches data, never calls the backend. Opt-in and disable-safe: off by
 * default, a no-op `{ skipped: true }` when off, and any failure of the
 * Render/Permission/Validation integration is captured, never propagated to
 * the Empresas screen.
 */
export class EmpresasTableFormShadow {
  /**
   * @param {Object} [options]
   * @param {boolean} [options.enabled] Explicit opt-in. When omitted, reads `MAK_RUNTIME_V2_SHADOW_EMPRESAS_TABLE_FORM` (off unless "true").
   * @param {() => number} [options.clock]
   * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
   * @param {object} [options.shadowMode] Injectable RuntimeShadowMode (for the comparison).
   * @param {{ can?: Function }} [options.permissionEngine] Optional M09 — marks/filters denied elements.
   * @param {{ describeFieldRules?: Function }} [options.validationEngine] Optional — attaches validation metadata.
   * @param {{ registerAdapter?: Function }} [options.renderEngine] Optional M12 — structures the render tree.
   * @param {{ recordEvent?: Function, recordMetric?: Function, captureError?: Function }} [options.observability]
   * @param {unknown} [options.context] Permission-evaluation context.
   */
  constructor(options = {}) {
    const {
      enabled,
      clock = () => Date.now(),
      descriptor,
      shadowMode,
      permissionEngine,
      validationEngine,
      renderEngine,
      observability,
      context,
    } = options;

    if (typeof clock !== 'function') {
      throw pilotError('MAK-L3-SHADOW-PILOT-002', 'EmpresasTableFormShadow "clock" option must be a function');
    }
    if (descriptor !== undefined && !isPlainObject(descriptor)) {
      throw pilotError('MAK-L3-SHADOW-PILOT-002', 'EmpresasTableFormShadow "descriptor" option must be an object');
    }

    this._clock = clock;
    this._enabled = enabled === undefined ? readEnvFlag() : Boolean(enabled);
    this._descriptor = descriptor ? { ...EMPRESAS_TABLE_FORM_DESCRIPTOR, ...descriptor } : EMPRESAS_TABLE_FORM_DESCRIPTOR;
    this._permissionEngine = permissionEngine ?? null;
    this._validationEngine = validationEngine ?? null;
    this._renderEngine = renderEngine ?? null;
    this._observability = observability ?? null;
    this._context = context ?? {};
    this._shadowMode = shadowMode ?? createRuntimeShadowMode({ enabled: true, clock: this._clock, observability: this._observability });

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
   * Structural table/form snapshot as the LEGACY runtime represents it — raw
   * field types, no permission filtering (public view). Deterministic.
   * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [input]
   * @returns {Promise<import('../../types/shadow-table-form.js').TableFormProjectionResult>}
   */
  async createLegacyTableFormSnapshot(input) {
    const descriptor = this._resolveDescriptor(input);
    return createTableFormProjection(descriptor, { runtime: 'legacy' });
  }

  /**
   * Intermediate table/form projection as RUNTIME V2 would produce it —
   * canonical field types, permission marking/filtering (when M09 injected),
   * validation metadata (when injected). Deterministic.
   * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [input]
   * @returns {Promise<import('../../types/shadow-table-form.js').TableFormProjectionResult>}
   */
  async createRuntimeV2TableFormProjection(input) {
    const descriptor = this._resolveDescriptor(input);
    return createTableFormProjection(descriptor, {
      runtime: 'v2',
      typeMap: V2_TYPE_MAP,
      permissionEngine: this._permissionEngine ?? undefined,
      validationEngine: this._validationEngine ?? undefined,
      renderEngine: this._renderEngine ?? undefined,
      context: this._context,
    });
  }

  /**
   * Deterministic structural comparison of a legacy snapshot against a runtime
   * v2 projection, via RuntimeShadowMode (sensitive-data masked, pollution
   * guarded). The `runtime` marker is excluded so only the structural table/
   * form shape is compared.
   * @param {import('../../types/shadow-table-form.js').TableFormProjectionResult} legacySnapshot
   * @param {import('../../types/shadow-table-form.js').TableFormProjectionResult} runtimeProjection
   * @returns {import('../types/shadow.js').ShadowComparison}
   */
  compareTableForm(legacySnapshot, runtimeProjection) {
    return this._shadowMode.compareWithLegacy(stripRuntimeMarker(legacySnapshot), stripRuntimeMarker(runtimeProjection));
  }

  /**
   * Runs one passive Empresas table/form shadow projection: builds the legacy
   * snapshot and runtime v2 projection, compares them, records diagnostics.
   * Disabled → `{ skipped: true }`. Any failure (including a throwing
   * Render/Permission/Validation integration) is captured in the report,
   * never propagated toward the Empresas UI.
   * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [input]
   * @returns {Promise<import('../../types/shadow-table-form.js').EmpresasTableFormShadowReport>}
   */
  async run(input) {
    validateProjectionInput(input, 0, 'Empresas table/form shadow input', pilotError); // structural — throws on pollution/depth

    if (!this._enabled) {
      return { skipped: true, moduleId: MODULE_ID, reason: 'empresas table/form shadow disabled', timestamp: this._clock() };
    }

    try {
      const legacySnapshot = await this.createLegacyTableFormSnapshot(input);
      const runtimeProjection = await this.createRuntimeV2TableFormProjection(input);
      const comparison = this.compareTableForm(legacySnapshot, runtimeProjection);

      this._runCount += 1;
      this._emitMetric('shadow.empresas_table_form.differences', comparison.differences.length);
      this._pushRecord(true, {
        equivalent: comparison.equivalent,
        differences: comparison.differences.length,
        tableColumns: runtimeProjection.table.columns.length,
        formFields: runtimeProjection.form.fields.length,
      });
      return {
        skipped: false,
        ok: true,
        moduleId: MODULE_ID,
        equivalent: comparison.equivalent,
        comparison,
        legacySnapshot,
        runtimeProjection,
        timestamp: this._clock(),
      };
    } catch (err) {
      // Render/Permission/Validation or comparison failure is isolated here.
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
      throw pilotError('MAK-L3-SHADOW-PILOT-001', 'Empresas table/form descriptor input must be a plain object');
    }
    validateProjectionInput(input, 0, 'Empresas table/form descriptor input', pilotError);
    return { ...this._descriptor, ...input };
  }

  /** @param {boolean} ok @param {unknown} detail */
  _pushRecord(ok, detail) {
    if (this._records.length >= MAX_DIAGNOSTICS) {
      throw pilotError('MAK-L3-SHADOW-PILOT-002', `Too many diagnostic records (> ${MAX_DIAGNOSTICS})`);
    }
    this._records.push({
      id: `empresas-tableform-shadow-${idCounter++}`,
      ok,
      detail: redactSensitive(safeClone(detail)),
      timestamp: this._clock(),
    });
  }

  /** @param {string} name @param {number} value */
  _emitMetric(name, value) {
    if (this._observability && typeof this._observability.recordMetric === 'function') {
      try {
        this._observability.recordMetric(name, value, { source: 'empresas-table-form-shadow' });
      } catch {
        // Observability failure must never break the projection.
      }
    }
  }

  /** @param {unknown} err */
  _captureError(err) {
    if (this._observability && typeof this._observability.captureError === 'function') {
      try {
        this._observability.captureError(err, { source: 'empresas-table-form-shadow' });
      } catch {
        // ignore
      }
    }
  }
}

/** @param {import('../../types/shadow-table-form.js').TableFormProjectionResult} projection */
function stripRuntimeMarker(projection) {
  const { runtime, renderEngineWired, ...rest } = /** @type {any} */ (projection);
  return rest;
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
 * @param {ConstructorParameters<typeof EmpresasTableFormShadow>[0]} [options]
 * @returns {EmpresasTableFormShadow}
 */
export function createEmpresasTableFormShadow(options) {
  return new EmpresasTableFormShadow(options);
}

export { createTableFormProjection, EmpresasShadowPilotError, EMPRESAS_TABLE_FORM_DESCRIPTOR };
