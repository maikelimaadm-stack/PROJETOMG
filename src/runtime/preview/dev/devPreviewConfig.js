import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasDevPreviewError } from './errors.js';

/** Dev-only opt-in flag. Off by default; only `'true'` enables. */
export const EMPRESAS_DEV_PREVIEW_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW';

/** Explicit, documented escape hatch to allow the dev preview in a production build. Off by default. */
export const EMPRESAS_DEV_PREVIEW_ALLOW_PROD_FLAG = 'MAK_RUNTIME_V2_EMPRESAS_DEV_PREVIEW_ALLOW_PROD';

const PREVIEW_HEADER = 'Empresas — Runtime v2 Preview';

/** @param {string} code @param {string} message */
function devError(code, message) {
  return new EmpresasDevPreviewError(/** @type {any} */ (code), message);
}

/**
 * Resolves the effective env bag. In Vite this reads `import.meta.env`; under
 * `node --test` that is undefined, so it falls back to `process.env`. Callers
 * may pass an explicit env for deterministic testing.
 * @returns {Record<string, unknown>}
 */
function resolveEnv() {
  /** @type {Record<string, unknown>} */
  let metaEnv = {};
  try {
    metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  } catch {
    metaEnv = {};
  }
  const procEnv = (typeof process !== 'undefined' && process.env) ? process.env : {};
  return { ...procEnv, ...metaEnv };
}

/**
 * Whether the dev-only visual preview is enabled. Off by default. It requires
 * the opt-in flag AND a non-production environment — in production it FAILS
 * CLOSED unless the explicit, documented `*_ALLOW_PROD` override is set.
 * @param {Record<string, unknown>} [env] Explicit env (for testing); defaults to import.meta.env/process.env.
 * @returns {boolean}
 */
export function isEmpresasDevPreviewEnabled(env) {
  const e = env ?? resolveEnv();
  const enabled = e[EMPRESAS_DEV_PREVIEW_FLAG] === 'true';
  if (!enabled) return false;
  const isProd = e.PROD === true || e.PROD === 'true' || e.NODE_ENV === 'production' || e.MODE === 'production';
  if (!isProd) return true;
  return e[EMPRESAS_DEV_PREVIEW_ALLOW_PROD_FLAG] === 'true';
}

/** @param {unknown} model */
function isPreviewModel(model) {
  return isPlainObject(model) && isPlainObject(model.table) && isPlainObject(model.form);
}

/**
 * Transforms a ControlledPreview preview model into a deterministic, plain
 * DEV VIEW MODEL — a render-ready structure the dev-only React components map
 * over. It never executes an action/workflow/connector, never touches data or
 * the backend. Sensitive keys are masked; prototype pollution is blocked; an
 * invalid preview model degrades to a safe fallback (never throws).
 *
 * @param {import('../../types/preview.js').PreviewModel} previewModel
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {boolean} [options.skipped]
 * @returns {import('../../types/dev-preview.js').EmpresasDevViewModel}
 */
export function createEmpresasDevPreviewModel(previewModel, options = {}) {
  // structural — prototype pollution / depth is a hard failure (thrown).
  validateProjectionInput(previewModel, 0, 'Empresas dev preview model', (_c, message) => devError('MAK-L3-DEV-PREVIEW-001', message));

  const enabled = isEmpresasDevPreviewEnabled(options.env);
  const baseStatus = { enabled, devOnly: true, skipped: Boolean(options.skipped) };

  if (!isPreviewModel(previewModel)) {
    // Safe fallback — an invalid preview model must never crash the dev harness.
    return {
      header: PREVIEW_HEADER,
      valid: false,
      status: baseStatus,
      table: { columns: [], rows: [] },
      form: { fields: [] },
      diagnostics: { warnings: ['invalid preview model — showing safe fallback'], differences: [], deniedFields: [], missingLabels: [], invalidMetadata: [], unsupportedFeatures: [] },
      differences: [],
      actions: [],
      workflows: [],
      metadata: {},
    };
  }

  const table = buildTableView(previewModel.table);
  const form = buildFormView(previewModel.form);
  const diagnostics = normalizeDiagnostics(previewModel.diagnostics);

  return {
    header: PREVIEW_HEADER,
    valid: true,
    status: baseStatus,
    table,
    form,
    diagnostics,
    differences: Array.isArray(diagnostics.differences) ? diagnostics.differences : [],
    // actions/workflows carried as text metadata only — never executable handles.
    actions: [
      ...(Array.isArray(previewModel.table.rowActions) ? previewModel.table.rowActions : []),
      ...(Array.isArray(previewModel.form.formActions) ? previewModel.form.formActions : []),
    ].map((a) => ({ id: String(a.id), kind: String(a.kind ?? 'action'), ref: String(a.ref), label: `${a.id} (${a.kind ?? 'action'}) → ${a.ref}` })),
    workflows: (Array.isArray(previewModel.form.formWorkflows) ? previewModel.form.formWorkflows : []).map((w) => ({ id: String(w.id), ref: String(w.ref), label: `${w.id} → ${w.ref}` })),
    metadata: /** @type {Record<string, unknown>} */ (redactSensitive(safeClone(previewModel.meta ?? {}))),
  };
}

/** @param {import('../../types/preview.js').PreviewTable} table */
function buildTableView(table) {
  const columns = (Array.isArray(table.columns) ? table.columns : []).map((c) => ({
    id: String(c.id),
    label: String(c.label ?? c.id),
    sortable: Boolean(c.sortable),
    filterable: Boolean(c.filterable),
    visible: c.visible !== false,
  }));
  return {
    columns,
    // A single structural header row descriptor — no real data rows are ever rendered.
    rows: [{ kind: 'header', cells: columns.map((c) => c.label) }],
  };
}

/** @param {import('../../types/preview.js').PreviewForm} form */
function buildFormView(form) {
  const fields = (Array.isArray(form.fields) ? form.fields : []).map((f) => ({
    id: String(f.id),
    label: String(f.label ?? f.id),
    type: String(f.type ?? ''),
    required: Boolean(f.required),
    permission: typeof f.permission === 'string' ? f.permission : '',
    denied: Boolean(f.denied),
    validationRules: isPlainObject(f.validation) && Array.isArray(f.validation.rules) ? [...f.validation.rules] : [],
  }));
  return { fields };
}

/** @param {unknown} diagnostics */
function normalizeDiagnostics(diagnostics) {
  const d = isPlainObject(diagnostics) ? diagnostics : {};
  return {
    warnings: Array.isArray(d.warnings) ? [...d.warnings] : [],
    differences: Array.isArray(d.differences) ? d.differences.map((x) => ({ path: String(x.path) })) : [],
    deniedFields: Array.isArray(d.deniedFields) ? [...d.deniedFields] : [],
    missingLabels: Array.isArray(d.missingLabels) ? [...d.missingLabels] : [],
    invalidMetadata: Array.isArray(d.invalidMetadata) ? [...d.invalidMetadata] : [],
    unsupportedFeatures: Array.isArray(d.unsupportedFeatures) ? [...d.unsupportedFeatures] : [],
  };
}
