import { deepFreeze } from './deepFreeze.js';
/** Permission/tenancy boundary (declared). Not integrated; product exposure blocked until a foundation exists. */
export const PERMISSION_TENANCY_BOUNDARY_CONTRACT = deepFreeze({
  kind: 'core-envelope-permission-tenancy-boundary-contract',
  permissionModelIntegrated: false, tenantModelIntegrated: false, serverSideAuthorizationIntegrated: false,
  requiresPermissionTenancyFoundationBeforeExposure: true, productExposureBlockedByPermissionTenancy: true,
});
export default PERMISSION_TENANCY_BOUNDARY_CONTRACT;
