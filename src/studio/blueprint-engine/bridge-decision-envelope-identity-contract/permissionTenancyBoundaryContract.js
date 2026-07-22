import { deepFreeze } from './deepFreeze.js';
export const PERMISSION_TENANCY_BOUNDARY_CONTRACT = deepFreeze({
  kind: 'envelope-permission-tenancy-boundary-contract',
  permissionModelIntegrated: false, tenantModelIntegrated: false, serverSideAuthorizationIntegrated: false,
  clientSideAuthorizationSufficient: false, productExposureBlockedByPermissionTenancy: true,
  requiresPermissionTenancyFoundationBeforeExposure: true,
});
export default PERMISSION_TENANCY_BOUNDARY_CONTRACT;
