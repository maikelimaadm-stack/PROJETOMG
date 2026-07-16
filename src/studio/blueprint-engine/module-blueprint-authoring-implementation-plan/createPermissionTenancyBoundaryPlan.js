import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Permission/tenancy boundary PLAN — declares that permission/tenancy remain NOT integrated and that
 * product exposure stays blocked until a dedicated Permission/Tenancy Foundation exists. No auth,
 * role, tenant, or backend implemented; no real auth imported. Metadata only.
 * @returns {Object}
 */
export function createPermissionTenancyBoundaryPlan() {
  const core = {
    kind: 'authoring-permission-tenancy-boundary-plan',
    permissionTenancyBoundaryPlanned: true,
    permissionModelIntegrated: false,
    tenantModelIntegrated: false,
    serverSideAuthorizationIntegrated: false,
    clientSideAuthorizationSufficient: false,
    productExposureBlockedByPermissionTenancy: true,
    requiresPermissionTenancyFoundation: true,
    authImported: false,
    rolesImplemented: false,
    tenantsImplemented: false,
  };
  return safeCloneGenericModel({ ...core, permissionTenancyBoundaryPlanDigest: authoringPlanDigest(core) });
}

export default createPermissionTenancyBoundaryPlan;
