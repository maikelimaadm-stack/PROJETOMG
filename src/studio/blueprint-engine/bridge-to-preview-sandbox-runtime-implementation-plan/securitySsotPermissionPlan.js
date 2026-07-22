import { deepFreeze } from './deepFreeze.js';

/**
 * SECURITY / SSOT / PERMISSION PLAN — the security, single-source-of-truth and permission/tenancy boundaries the
 * future runtime must preserve. Declaration only. The certified blueprint remains the SSOT; the runtime may never
 * certify, publish, register, generate modules, expose products or read/write real data, and product exposure
 * stays blocked until a Permission/Tenancy foundation exists.
 */
export const SECURITY_SSOT_PERMISSION_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-security-ssot-permission-plan',
  certifiedBlueprintRemainsSsot: true,
  runtimeMayCertify: false,
  runtimeMayPublish: false,
  runtimeMayRegister: false,
  runtimeMayGenerateModule: false,
  runtimeMayExposeProduct: false,
  runtimeMayReadRealData: false,
  runtimeMayWriteRealData: false,
  permissionModelIntegrated: false,
  tenantModelIntegrated: false,
  serverSideAuthorizationIntegrated: false,
  productExposureBlockedByPermissionTenancy: true,
  ssotInversionForbidden: true,
  issueCodes: deepFreeze([
    'RUNTIME_SSOT_INVERSION_FORBIDDEN', 'RUNTIME_PERMISSION_INTEGRATION_FORBIDDEN',
    'RUNTIME_PRODUCT_EXPOSURE_FORBIDDEN', 'RUNTIME_CERTIFICATION_FORBIDDEN', 'RUNTIME_MODULE_GENERATION_FORBIDDEN',
    'RUNTIME_REAL_DATA_FORBIDDEN',
  ]),
  securityImplemented: false,
});

export default SECURITY_SSOT_PERMISSION_PLAN;
