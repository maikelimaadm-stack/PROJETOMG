import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Bridges the sandbox TABLE preview metadata into a dev-preview table schema. Pure,
 * metadata-only. Protected columns stay protected; no data fetch; no component; no mutation.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} table bridge schema
 */
export function createDevPreviewTableBridgeSchema(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const t = isGenericModelPlainObject(o.sandbox?.tablePreviewMetadata) ? o.sandbox.tablePreviewMetadata : {};
  const columns = Array.isArray(t.columns) ? t.columns.filter(isGenericModelPlainObject) : [];

  const core = {
    kind: 'dev-preview-table-bridge-schema',
    moduleId: String(o.sandbox?.moduleId ?? 'plannedModule'),
    columns: columns.map((c) => ({
      name: c.name,
      label: c.label ?? c.name,
      type: c.type,
      visible: c.visible !== false && c.protectedColumn !== true,
      protectedColumn: c.protectedColumn === true,
      tenantColumn: c.tenantColumn === true,
      sortable: c.sortable === true,
      componentKind: 'table',
    })),
    rowActionsMetadata: [{ action: 'view', enabled: false, mutation: false }],
    dataFetched: false,
    componentCreated: false,
    mutationAllowed: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, tableBridgeDigest: bridgeDigest(core) });
}

export default createDevPreviewTableBridgeSchema;
