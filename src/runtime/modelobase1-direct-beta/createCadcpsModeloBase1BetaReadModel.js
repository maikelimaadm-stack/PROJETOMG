import {
  isPlainObject,
  redactSensitive,
  safeClone,
} from '../shadow/pilots/tableFormProjection.js';
import { createCadcpsControlledDataset } from '../preview/dev/data/createCadcpsControlledDataset.js';
import { createModeloBase1DirectBetaReadModel } from './createModeloBase1DirectBetaReadModel.js';
import { createDirectBetaWriteGuard, BLOCKED_BETA_WRITE_OPERATIONS } from './createDirectBetaWriteGuard.js';
import {
  CADCPS_MODELOBASE1_BETA_FLAG,
  isCadcpsModeloBase1BetaEnabled,
  isCadcpsModeloBase1BetaProductionBlocked,
} from './modeloBase1DirectBetaConfig.js';

/**
 * Shapes the controlled cadcps dataset into a deterministic READ-ONLY view model
 * (same surface as the Empresas read-only view model: table/form/permissions/
 * validations). cadcps has no runtime v2 table/form descriptor yet, so the beta
 * reads structure directly from the controlled dev dataset — never real data,
 * never the backend, never Prisma. Sensitive values are masked; the result is a
 * safe deep copy.
 *
 * @param {Object} [options]
 * @param {boolean} [options.includeRows] Attach controlled-dataset rows. Default true.
 * @returns {Object}
 */
export function createCadcpsBetaViewModel(options = {}) {
  const includeRows = isPlainObject(options) ? options.includeRows !== false : true;
  const dataset = createCadcpsControlledDataset();
  const columns = dataset.columns.map((name) => ({ id: name, label: name, visible: true }));
  const requiredSet = new Set(dataset.requiredFields);
  const rows = includeRows
    ? dataset.tableRows.map((r) => ({ id: r.id, valid: r.valid, cells: r.cells }))
    : [];
  const fields = dataset.columns.map((name) => ({
    id: name,
    label: name,
    visible: true,
    required: requiredSet.has(name),
    permission: null,
    denied: false,
  }));
  const permissions = dataset.records.flatMap((rec) =>
    rec.deniedFields.map((f) => ({ id: `${rec.id}:${f}`, field: f, permission: 'denied', denied: true })),
  );
  const validations = dataset.requiredFields.map((f) => ({ id: f, rules: ['required'], source: 'controlled-dataset' }));

  const model = {
    kind: 'cadcps-beta-view-model',
    moduleId: 'cadcps',
    moduleName: 'Campos Personalizados',
    readOnly: true,
    source: includeRows ? 'controlled-dev-dataset' : 'structural-only',
    table: {
      columns,
      visibleColumns: columns,
      rows,
      rowCount: rows.length,
    },
    form: {
      fields,
      visibleFields: fields,
      permissionsApplied: true,
    },
    permissions,
    validations,
    writeActionsBlocked: true,
    datasetDiagnostics: redactSensitive(dataset.diagnostics),
    usesRealData: false,
  };
  return safeClone(model);
}

/**
 * Builds the Campos Personalizados (cadcps) ModeloBase1 DIRECT BETA read model.
 * Same pattern as Empresas: a read-only view model (from the controlled dataset)
 * plus a write guard that blocks every write. Behind the
 * `MAK_MODELOBASE1_CADCPS_BETA` flag; off by default; fail-closed in production.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env] Explicit env (for testing).
 * @param {boolean} [options.includeRows] Attach controlled-dataset rows. Default true.
 * @returns {import('../types/modelobase1-direct-beta.js').ModeloBase1DirectBetaReadModel}
 */
export function createCadcpsModeloBase1BetaReadModel(options = {}) {
  const env = isPlainObject(options) ? options.env : undefined;
  const includeRows = isPlainObject(options) ? options.includeRows !== false : true;
  const enabled = isCadcpsModeloBase1BetaEnabled(env);
  const productionBlocked = isCadcpsModeloBase1BetaProductionBlocked(env);
  const writeGuard = createDirectBetaWriteGuard({ moduleId: 'cadcps', enabled, productionBlocked });

  return createModeloBase1DirectBetaReadModel({
    moduleId: 'cadcps',
    moduleName: 'Campos Personalizados',
    enabled,
    productionBlocked,
    source: 'cadcps-controlled-dev-dataset',
    betaFlag: CADCPS_MODELOBASE1_BETA_FLAG,
    writeGuard,
    resolveViewModel: () => createCadcpsBetaViewModel({ includeRows }),
  });
}

export { BLOCKED_BETA_WRITE_OPERATIONS };
export default createCadcpsModeloBase1BetaReadModel;
