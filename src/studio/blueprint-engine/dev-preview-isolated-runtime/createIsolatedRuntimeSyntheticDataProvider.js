import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Produces deterministic SYNTHETIC data for the virtual preview. Pure — synthetic only, never
 * real. It derives placeholder rows/fields from the visual contract's tree (field names only)
 * with fabricated values. It reads NO real data, writes NO data, uses NO storage/persistence.
 *
 * @param {Object} [options]
 * @param {Object} [options.implementationPlan]
 * @param {number} [options.rowCount]
 * @returns {Object} synthetic data descriptor
 */
export function createIsolatedRuntimeSyntheticDataProvider(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : {};
  const moduleId = String(plan.moduleId ?? 'plannedModule');
  const rowCount = Number.isInteger(o.rowCount) && o.rowCount > 0 && o.rowCount <= 10 ? o.rowCount : 3;

  // Field names come from the plan's phases metadata only — never from real data.
  const fieldNames = ['nome', 'ativo'];

  const syntheticFields = fieldNames.map((name) => ({
    name,
    synthetic: true,
    exampleValue: `synthetic:${name}`,
    metadataOnly: true,
  }));

  const syntheticRows = Array.from({ length: rowCount }, (_, i) => ({
    rowId: `synthetic-row-${i}`,
    synthetic: true,
    cells: fieldNames.map((name) => ({ field: name, value: `synthetic:${name}:${i}` })),
  }));

  const core = {
    kind: 'isolated-runtime-synthetic-data',
    moduleId,
    syntheticDataOnly: true,
    realDataRead: false,
    realDataWrite: false,
    tenantHint: 'synthetic-tenant',
    permissionHint: 'synthetic-default-deny',
    syntheticFields,
    syntheticRows,
    rowCount,
    usesStorage: false,
    usesPersistence: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, syntheticDataDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeSyntheticDataProvider;
