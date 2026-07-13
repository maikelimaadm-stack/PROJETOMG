import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { STUDIO_PERMISSION_ACTIONS, STUDIO_PERMISSION_LEVELS } from '../createStudioPermissionBlueprintContract.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical permission contract. Pure. Fail-closed / default-deny;
 * admin never bypasses tenant; delete/mutation never start enabled; protected fields
 * require an explicit rule; row-level access preserves tenant.
 *
 * @param {Object} [options]
 * @returns {Object} canonical permission contract
 */
export function createStudioCanonicalPermissionContract(options = {}) {
  void options;
  const body = {
    kind: 'studio-canonical-permission-contract',
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
  };
  return safeCloneGenericModel({ ...body, canonicalPermissionContractDigest: certificationDigest({ actions: STUDIO_PERMISSION_ACTIONS, levels: STUDIO_PERMISSION_LEVELS, defaultDeny: true }) });
}

export default createStudioCanonicalPermissionContract;
