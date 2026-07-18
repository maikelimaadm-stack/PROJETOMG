import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * PERMISSION / TENANCY BOUNDARY PLAN — no permission/tenant/server-side authorization integrated;
 * client-side authorization insufficient; product exposure blocked until a dedicated foundation exists.
 * Metadata only. @returns {Object}
 */
export function createBridgePermissionTenancyBoundaryPlan() {
  const core = {
    kind: 'bridge-permission-tenancy-boundary-plan',
    permissionTenancyBoundaryPlanOnly: true,
    permissionModelIntegrated: false,
    tenantModelIntegrated: false,
    serverSideAuthorizationIntegrated: false,
    clientSideAuthorizationSufficient: false,
    productExposureBlockedByPermissionTenancy: true,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    authImported: false,
  };
  return safeCloneGenericModel({ ...core, permissionTenancyBoundaryPlanDigest: bridgePlanDigest(core) });
}

export default createBridgePermissionTenancyBoundaryPlan;
