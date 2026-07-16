import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * The PERMISSION / TENANCY BOUNDARY CONTRACT — declares, as metadata, that permission and tenancy are
 * NOT integrated and that product exposure remains blocked until a dedicated Permission/Tenancy
 * Foundation exists. This foundation implements NO login, role, tenant or backend; it imports no real
 * auth. It records that server-side authorization is not integrated and that client-side authorization
 * alone is insufficient for exposure. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createPermissionTenancyBoundaryContract() {
  const core = {
    kind: 'authoring-permission-tenancy-boundary-contract',
    permissionModelIntegrated: false,
    tenantModelIntegrated: false,
    serverSideAuthorizationIntegrated: false,
    clientSideAuthorizationSufficient: false,
    productExposureBlockedByPermissionTenancy: true,
    requiresPermissionTenancyFoundation: true,
    requiresPermissionFoundation: true,
    requiresTenancyFoundation: true,
    permissionImplementedHere: false,
    tenancyImplementedHere: false,
    readsTenantData: false,
    resolvesPermissions: false,
    crossesTenantBoundary: false,
    bypassesPermission: false,
    bypassesTenancy: false,
    authImported: false,
    enforcementDeferredToFutureRuntime: true,
    boundaryOnly: true,
  };
  return safeCloneGenericModel({ ...core, permissionTenancyDigest: authoringFoundationDigest(core) });
}

export default createPermissionTenancyBoundaryContract;
