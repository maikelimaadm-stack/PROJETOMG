import {
  isPlainObject,
  validateProjectionInput,
  redactSensitive,
  safeClone,
  createTableFormProjection,
} from '../../shadow/pilots/tableFormProjection.js';
import { EMPRESAS_TABLE_FORM_DESCRIPTOR } from '../../shadow/pilots/empresasTableFormShadow.js';
import { createEmpresasControlledDataset } from '../../preview/dev/data/createControlledDevDataset.js';
import { EmpresasDualReadError } from './errors.js';

const MODULE_ID = 'empresas';

/** @param {string} code @param {string} message */
function snapError(code, message) {
  return new EmpresasDualReadError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain LEGACY READ SNAPSHOT of Empresas, normalized
 * to the shared dual-read shape. It represents Empresas as the LEGACY runtime
 * reads it — raw field types, no permission filtering — via the existing
 * table/form projection (`runtime: 'legacy'`) plus controlled-dataset rows.
 *
 * Never calls the backend, never queries Prisma/MMM, never uses real data as
 * the primary source. A caller may inject a pre-built legacy snapshot via
 * `options.snapshot` (validated, masked). Prototype pollution is blocked and the
 * result is a safe deep copy.
 *
 * @param {Object} [options]
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot} [options.snapshot] Injected legacy snapshot.
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @param {boolean} [options.includeRows] Default true.
 * @returns {Promise<import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot>}
 */
export async function createEmpresasLegacyReadSnapshot(options = {}) {
  validateProjectionInput(options, 0, 'Empresas legacy read snapshot options', snapError);
  if (!isPlainObject(options)) {
    throw snapError('MAK-L3-EMP-DUALREAD-003', 'createEmpresasLegacyReadSnapshot() options must be a plain object');
  }

  // Injected legacy snapshot — normalize + mask, never trust it blindly.
  if (options.snapshot !== undefined) {
    if (!isPlainObject(options.snapshot)) {
      throw snapError('MAK-L3-EMP-DUALREAD-004', 'injected legacy snapshot must be a plain object');
    }
    return normalizeSnapshot({ ...options.snapshot, sourceRuntime: 'legacy' });
  }

  const descriptor = options.descriptor
    ? { ...EMPRESAS_TABLE_FORM_DESCRIPTOR, ...options.descriptor }
    : EMPRESAS_TABLE_FORM_DESCRIPTOR;
  const includeRows = options.includeRows !== false;

  // Legacy projection: raw types, no permission engine (public view).
  const projection = await createTableFormProjection(descriptor, { runtime: 'legacy' });
  const dataset = includeRows ? createEmpresasControlledDataset() : null;
  const rows = dataset ? dataset.tableRows.map((r) => ({ id: r.id, valid: r.valid, cells: r.cells })) : [];

  const snapshot = buildSnapshot({
    sourceRuntime: 'legacy',
    projection,
    rows,
    datasetDiagnostics: dataset ? dataset.diagnostics : null,
    source: includeRows ? 'controlled-dev-dataset' : 'structural-only',
  });
  return normalizeSnapshot(snapshot);
}

/**
 * Shared snapshot shape builder — used by both the legacy and (indirectly) the
 * runtime v2 snapshot so the comparator sees the exact same fields.
 * @param {Object} args
 */
export function buildSnapshot(args) {
  const { sourceRuntime, projection, rows, datasetDiagnostics, source } = args;
  const fields = projection.form.fields;
  return {
    sourceRuntime,
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    table: {
      columns: projection.table.columns,
      visibleColumns: projection.table.visibleColumns,
      rows,
      rowCount: rows.length,
    },
    form: {
      fields,
      visibleFields: projection.form.visibleFields,
    },
    permissions: fields.map((f) => ({ id: f.id, permission: f.permission ?? null, denied: Boolean(f.denied) })),
    validations: fields.map((f) => ({ id: f.id, rules: f.validation?.rules ?? [], source: f.validation?.source ?? 'descriptor' })),
    actions: [
      ...(projection.table.actions ?? []).map((a) => ({ id: a.id, kind: a.kind, ref: a.ref, scope: 'table' })),
      ...(projection.form.actions ?? []).map((a) => ({ id: a.id, kind: a.kind, ref: a.ref, scope: 'form' })),
    ],
    metadata: { source, runtime: sourceRuntime },
    diagnostics: {
      columnCount: projection.table.columns.length,
      fieldCount: fields.length,
      rowCount: rows.length,
      datasetDiagnostics: datasetDiagnostics ? redactSensitive(datasetDiagnostics) : null,
    },
  };
}

/**
 * Normalizes/masks any snapshot to the safe, deterministic dual-read shape.
 * @param {Record<string, unknown>} snapshot
 * @returns {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot}
 */
export function normalizeSnapshot(snapshot) {
  return /** @type {any} */ (safeClone(redactSensitive(snapshot)));
}
