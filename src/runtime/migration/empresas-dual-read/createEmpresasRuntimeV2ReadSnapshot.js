import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { createEmpresasReadOnlyViewModel } from '../empresas-readonly/createEmpresasReadOnlyViewModel.js';
import { createEmpresasReadOnlyWriteGuard, BLOCKED_WRITE_OPERATIONS } from '../empresas-readonly/empresasReadOnlyWriteGuard.js';
import { normalizeSnapshot } from './createEmpresasLegacyReadSnapshot.js';
import { EmpresasDualReadError } from './errors.js';

const MODULE_ID = 'empresas';

/** @param {string} code @param {string} message */
function snapError(code, message) {
  return new EmpresasDualReadError(/** @type {any} */ (code), message);
}

/**
 * Builds the deterministic, plain RUNTIME V2 READ SNAPSHOT of Empresas,
 * normalized to the shared dual-read shape. It REUSES the read-only view model
 * (canonical field types, controlled-dataset rows) and keeps the write guard
 * active. It never calls the backend, never queries Prisma/MMM, never uses real
 * data as the primary source. Prototype pollution is blocked; the result is a
 * safe deep copy. The live write guard is re-attached after cloning.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @param {import('../../types/shadow-table-form.js').TableFormDescriptor} [options.descriptor]
 * @param {boolean} [options.includeRows] Default true.
 * @returns {Promise<import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadSnapshot>}
 */
export async function createEmpresasRuntimeV2ReadSnapshot(options = {}) {
  validateProjectionInput(options, 0, 'Empresas runtime v2 read snapshot options', snapError);
  if (!isPlainObject(options)) {
    throw snapError('MAK-L3-EMP-DUALREAD-003', 'createEmpresasRuntimeV2ReadSnapshot() options must be a plain object');
  }

  const viewModel = await createEmpresasReadOnlyViewModel({ descriptor: options.descriptor, includeRows: options.includeRows });
  const writeGuard = createEmpresasReadOnlyWriteGuard({ env: options.env });

  const snapshot = {
    sourceRuntime: 'runtime-v2',
    moduleId: MODULE_ID,
    moduleName: 'Empresas',
    table: {
      columns: viewModel.table.columns,
      visibleColumns: viewModel.table.visibleColumns,
      rows: viewModel.table.rows,
      rowCount: viewModel.table.rowCount,
    },
    form: {
      fields: viewModel.form.fields,
      visibleFields: viewModel.form.visibleFields,
    },
    permissions: viewModel.permissions,
    validations: viewModel.validations,
    actions: [
      ...viewModel.actions.map((a) => ({ id: a.id, kind: a.kind, ref: a.ref, scope: 'form', blocked: true })),
    ],
    blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
    metadata: { source: viewModel.source, runtime: 'runtime-v2' },
    diagnostics: {
      columnCount: viewModel.table.columns.length,
      fieldCount: viewModel.form.fields.length,
      rowCount: viewModel.table.rowCount,
      datasetDiagnostics: viewModel.datasetDiagnostics,
    },
  };
  const normalized = /** @type {any} */ (normalizeSnapshot(snapshot));
  // Re-attach the live write guard (its attempt() function is dropped by JSON clone).
  normalized.writeGuard = writeGuard;
  return normalized;
}
