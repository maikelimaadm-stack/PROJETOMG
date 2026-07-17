import { bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** Permission/tenancy boundary — NOT integrated; exposure blocked until a dedicated foundation. Pure. */
export function createBridgePermissionTenancyBoundaryContract() {
  const core = {
    kind: 'bridge-permission-tenancy-boundary-contract',
    permissionModelIntegrated: false,
    tenantModelIntegrated: false,
    serverSideAuthorizationIntegrated: false,
    clientSideAuthorizationSufficient: false,
    productExposureBlockedByPermissionTenancy: true,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    authImported: false,
  };
  return safeCloneGenericModel({ ...core, permissionTenancyBoundaryContractDigest: bridgeDigest(core) });
}

export default createBridgePermissionTenancyBoundaryContract;
