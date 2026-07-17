import { createDeterministicDigest } from './createDeterministicDigest.js';

/** Permission/tenancy boundary — NOT integrated; exposure blocked until a dedicated foundation. Pure. */
export function createAuthoringRuntimePermissionTenancyBoundary() {
  const core = {
    kind: 'authoring-runtime-permission-tenancy-boundary',
    permissionModelIntegrated: false,
    tenantModelIntegrated: false,
    serverSideAuthorizationIntegrated: false,
    clientSideAuthorizationSufficient: false,
    productExposureBlockedByPermissionTenancy: true,
    requiresPermissionTenancyFoundation: true,
    authImported: false,
    realTenantUsed: false,
    realEmpresaUsed: false,
    safeBecauseNotExposed: true,
  };
  return Object.freeze({ ...core, permissionTenancyDigest: createDeterministicDigest(core) });
}

export default createAuthoringRuntimePermissionTenancyBoundary;
