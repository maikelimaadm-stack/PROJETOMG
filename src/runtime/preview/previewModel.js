import {
  isPlainObject,
  redactSensitive,
  safeClone,
} from '../shadow/pilots/tableFormProjection.js';
import { ControlledPreviewError } from './errors.js';

/**
 * Builds an isolated, plain-object PREVIEW MODEL from a runtime v2 table/form
 * projection. The result is never a DOM node and never a React element — it
 * is a serializable description of what a table/form would look like, for
 * validation/diagnostics only. It never renders, never executes an
 * action/workflow/connector, never touches data or the backend.
 *
 * @param {import('../types/shadow-table-form.js').TableFormProjectionResult} projection
 * @param {Object} [options]
 * @param {Array<{path: string}>} [options.differences] Structural differences (legacy vs v2), attached to diagnostics.
 * @returns {import('../types/preview.js').PreviewModel}
 */
export function createPreviewModel(projection, options = {}) {
  if (!isPlainObject(projection) || !isPlainObject(projection.table) || !isPlainObject(projection.form)) {
    throw new ControlledPreviewError('MAK-L3-PREVIEW-001', 'createPreviewModel() requires a projection with { table, form }');
  }

  const table = buildTablePreview(projection.table);
  const form = buildFormPreview(projection.form);
  const diagnostics = buildDiagnostics(projection, table, form, options.differences ?? []);

  const model = {
    moduleId: String(projection.moduleId ?? 'empresas'),
    entityName: String(projection.entityName ?? ''),
    kind: /** @type {'preview-model'} */ ('preview-model'),
    isPreviewModel: true,
    table,
    form,
    diagnostics,
    meta: /** @type {Record<string, unknown>} */ (redactSensitive(safeClone(projection.meta ?? {}))),
  };
  // A safe, independent clone — mutating the returned model never reaches internal projection state.
  return /** @type {import('../types/preview.js').PreviewModel} */ (safeClone(model));
}

/** @param {import('../types/shadow-table-form.js').TableProjection} table */
function buildTablePreview(table) {
  const columns = (Array.isArray(table.columns) ? table.columns : []).map((c) => ({
    id: String(c.id),
    label: typeof c.label === 'string' ? c.label : String(c.id),
    sortable: Boolean(c.sortable),
    filterable: Boolean(c.filterable),
    visible: c.visible !== false,
  }));
  /** @type {Record<string, string>} */
  const headerLabels = {};
  /** @type {Record<string, {sortable: boolean, filterable: boolean}>} */
  const cellMetadata = {};
  for (const c of columns) {
    headerLabels[c.id] = c.label;
    cellMetadata[c.id] = { sortable: c.sortable, filterable: c.filterable };
  }
  return {
    columns,
    visibleColumns: Array.isArray(table.visibleColumns) ? [...table.visibleColumns] : columns.filter((c) => c.visible).map((c) => c.id),
    headerLabels,
    cellMetadata,
    rowActions: Array.isArray(table.actions) ? table.actions.map((a) => ({ ...a })) : [], // metadata only
  };
}

/** @param {import('../types/shadow-table-form.js').FormProjection} form */
function buildFormPreview(form) {
  const fields = (Array.isArray(form.fields) ? form.fields : []).map((f) => ({
    id: String(f.id),
    label: typeof f.label === 'string' ? f.label : String(f.id),
    type: String(f.type),
    required: Boolean(f.required),
    permission: typeof f.permission === 'string' ? f.permission : undefined,
    permitted: f.permitted !== false,
    denied: Boolean(f.denied),
    validation: isPlainObject(f.validation) ? { rules: [...(f.validation.rules ?? [])], source: f.validation.source ?? 'descriptor' } : { rules: [], source: 'descriptor' },
  }));
  const visibleFields = Array.isArray(form.visibleFields) ? [...form.visibleFields] : fields.filter((f) => !f.denied).map((f) => f.id);
  const sections = [{ id: 'default', label: 'Empresa', fields: visibleFields }];
  return {
    fields,
    visibleFields,
    sections,
    formActions: Array.isArray(form.actions) ? form.actions.map((a) => ({ ...a })) : [], // metadata only
    formWorkflows: Array.isArray(form.workflows) ? form.workflows.map((w) => ({ ...w })) : [], // metadata only
  };
}

/**
 * @param {import('../types/shadow-table-form.js').TableFormProjectionResult} projection
 * @param {ReturnType<typeof buildTablePreview>} table
 * @param {ReturnType<typeof buildFormPreview>} form
 * @param {Array<{path: string}>} differences
 * @returns {import('../types/preview.js').PreviewDiagnostics}
 */
function buildDiagnostics(projection, table, form, differences) {
  const deniedFields = form.fields.filter((f) => f.denied).map((f) => f.id).sort();
  const missingLabels = [
    ...table.columns.filter((c) => c.label === c.id).map((c) => `column:${c.id}`),
    ...form.fields.filter((f) => f.label === f.id).map((f) => `field:${f.id}`),
  ].sort();
  const invalidMetadata = form.fields.filter((f) => !f.type || f.type === 'undefined').map((f) => `field:${f.id}`).sort();
  /** @type {string[]} */
  const unsupportedFeatures = [];
  if (Array.isArray(projection.form?.workflows) && projection.form.workflows.length > 0) {
    // Workflows are shown as metadata only — flagged as "not previewable as behavior" (informational).
    unsupportedFeatures.push('form.workflows:metadata-only');
  }
  /** @type {string[]} */
  const warnings = [];
  if (deniedFields.length > 0) warnings.push(`${deniedFields.length} field(s) denied by permission`);
  if (missingLabels.length > 0) warnings.push(`${missingLabels.length} element(s) without an explicit label`);

  return {
    warnings,
    differences: differences.map((d) => ({ path: String(d.path) })),
    deniedFields,
    missingLabels,
    invalidMetadata,
    unsupportedFeatures,
  };
}
