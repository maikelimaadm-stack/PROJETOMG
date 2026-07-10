import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
  createTableFormProjection,
} from '../../shadow/pilots/tableFormProjection.js';
import { EMPRESAS_TABLE_FORM_DESCRIPTOR } from '../../shadow/pilots/empresasTableFormShadow.js';
import { createEmpresasControlledDataset } from '../../preview/dev/data/createControlledDevDataset.js';
import { EmpresasReadOnlyError } from './errors.js';

const MODULE_ID = 'empresas';

/** @param {string} code @param {string} message */
function viewError(code, message) {
  return new EmpresasReadOnlyError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain READ-ONLY VIEW MODEL for Empresas. It reuses
 * the existing table/form projection (runtime v2 shape) and, when rows are
 * requested, the controlled dev dataset — NEVER real data, never the backend,
 * never Prisma. It contains no React element, no click handler, no execution
 * path. Write actions are surfaced as metadata flagged `blocked`. Sensitive
 * keys are masked, prototype pollution is blocked, and the result is a safe
 * deep copy.
 *
 * @param {Object} [options]
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @param {boolean} [options.includeRows] When true, attach controlled-dataset rows (mock only). Default true.
 * @returns {Promise<import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel>}
 */
export async function createEmpresasReadOnlyViewModel(options = {}) {
  validateProjectionInput(options, 0, 'Empresas read-only view model options', viewError);
  if (!isPlainObject(options)) {
    throw viewError('MAK-L3-EMP-READONLY-004', 'createEmpresasReadOnlyViewModel() options must be a plain object');
  }
  const descriptor = options.descriptor
    ? { ...EMPRESAS_TABLE_FORM_DESCRIPTOR, ...options.descriptor }
    : EMPRESAS_TABLE_FORM_DESCRIPTOR;
  const includeRows = options.includeRows !== false;

  // Runtime v2 projection (no permission engine → all permitted; canonical types).
  const projection = await createTableFormProjection(descriptor, { runtime: 'v2' });

  // Rows come ONLY from the controlled dataset (mock, masked) — never real data.
  const dataset = includeRows ? createEmpresasControlledDataset() : null;
  const rows = dataset ? dataset.tableRows.map((r) => ({ id: r.id, valid: r.valid, cells: r.cells })) : [];

  // Write actions from the descriptor's table/form, surfaced as blocked metadata.
  const rawActions = [
    ...(projection.table.actions ?? []),
    ...(projection.form.actions ?? []),
  ];
  const writeActionsBlocked = rawActions.map((a) => ({
    id: a.id,
    kind: a.kind,
    ref: a.ref,
    blocked: true,
    reason: 'read-only candidate — write action not executable',
  }));
  const workflowsBlocked = (projection.form.workflows ?? []).map((w) => ({
    id: w.id,
    ref: w.ref,
    blocked: true,
    reason: 'read-only candidate — workflow not startable',
  }));

  const model = {
    kind: 'empresas-readonly-view-model',
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    readOnly: true,
    source: includeRows ? 'controlled-dev-dataset' : 'structural-only',
    table: {
      columns: projection.table.columns,
      visibleColumns: projection.table.visibleColumns,
      rows,
      rowCount: rows.length,
    },
    form: {
      fields: projection.form.fields,
      visibleFields: projection.form.visibleFields,
      permissionsApplied: projection.form.permissionsApplied,
    },
    permissions: projection.form.fields.map((f) => ({ id: f.id, permission: f.permission ?? null, denied: Boolean(f.denied) })),
    validations: projection.form.fields.map((f) => ({ id: f.id, rules: f.validation?.rules ?? [], source: f.validation?.source ?? 'descriptor' })),
    actions: writeActionsBlocked,
    workflows: workflowsBlocked,
    writeActionsBlocked: true,
    datasetDiagnostics: dataset ? redactSensitive(dataset.diagnostics) : null,
    emptyState: rows.length === 0 ? { empty: true, message: 'no controlled rows attached (structural-only view)' } : { empty: false },
    diagnostics: {
      projectionRuntime: projection.runtime,
      columnCount: projection.table.columns.length,
      fieldCount: projection.form.fields.length,
      rowCount: rows.length,
      blockedActionCount: writeActionsBlocked.length + workflowsBlocked.length,
      usesRealData: false,
    },
  };
  return /** @type {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel} */ (safeClone(model));
}
