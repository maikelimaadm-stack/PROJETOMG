import { deepFreeze } from './deepFreeze.js';

/** PERMISSION / TENANCY / PRODUCT boundary — nothing integrated; exposure blocked; bridge is not exposed. */
export function createBridgePermissionTenancyBoundary() {
  return deepFreeze({
    kind: 'bridge-permission-tenancy-boundary',
    permissionModelIntegrated: false,
    tenantModelIntegrated: false,
    serverSideAuthorizationIntegrated: false,
    clientSideAuthorizationSufficient: false,
    productExposureBlockedByPermissionTenancy: true,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    bridgeExistsWithoutPermissionTenancyBecauseNotExposed: true,
    temporaryAuthCreated: false,
    realUserContextImported: false,
    realTenantContextImported: false,
    realDataUsed: false,
  });
}

export default createBridgePermissionTenancyBoundary;
