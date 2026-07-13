import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

export const STUDIO_PERMISSION_ACTIONS = ['read', 'create', 'update', 'delete', 'export', 'configure', 'approve', 'diagnostics', 'admin'];
export const STUDIO_PERMISSION_LEVELS = ['module', 'screen', 'field', 'row', 'tenant'];

/**
 * The Permission Blueprint contract. Pure. Fail-closed / default-deny: delete and
 * mutation never start enabled; admin never bypasses tenant; protected fields need
 * field-level visibility; row-level access preserves tenant scope.
 *
 * @param {Object} [options]
 * @returns {Object} permission blueprint contract descriptor
 */
export function createStudioPermissionBlueprintContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const body = {
    kind: 'studio-permission-blueprint-contract',
    actions: [...STUDIO_PERMISSION_ACTIONS],
    levels: [...STUDIO_PERMISSION_LEVELS],
    failClosed: true,
    defaultDeny: true,
    missingPermissionBlocks: true,
    adminBypassesTenant: false,
    deleteEnabledByDefault: false,
    mutationEnabledByDefault: false,
    fieldLevelVisibilityRequiredForProtected: true,
    rowLevelAccessPreservesTenant: true,
    productionPermissionsRequireExplicitPolicy: true,
    rules: [
      'failClosed / defaultDeny',
      'missing permission blocks',
      'admin does not bypass tenant',
      'delete does not start enabled',
      'mutation does not start enabled',
      'field-level visibility required for protected fields',
      'row-level access preserves tenant scope',
      'production permissions require an explicit future policy',
    ],
  };
  return safeCloneGenericModel({ ...body, permissionBlueprintDigest: createStudioContractDigest({ value: { actions: STUDIO_PERMISSION_ACTIONS, levels: STUDIO_PERMISSION_LEVELS, defaultDeny: true } }) });
}

export default createStudioPermissionBlueprintContract;
