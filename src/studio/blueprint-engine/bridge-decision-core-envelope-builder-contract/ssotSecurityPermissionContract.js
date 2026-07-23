import { deepFreeze } from './deepFreeze.js';
/** SSOT / security / permission boundary (declared). Certified blueprint remains SSOT. */
export const SSOT_SECURITY_PERMISSION_CONTRACT = deepFreeze({
  kind: 'builder-ssot-security-permission-contract',
  sourceBridgeDecisionIsCanonical: false, bridgeDecisionCoreIsCanonical: false, coreEnvelopeIsCanonical: false,
  certifiedBlueprintRemainsSsot: true,
  builderMayCertify: false, builderMayPublish: false, builderMayRegister: false, builderMayGenerateModule: false,
  builderMayExposeProduct: false, builderMayReadRealData: false, builderMayWriteRealData: false,
  permissionModelIntegrated: false, tenantModelIntegrated: false, serverSideAuthorizationIntegrated: false,
  productExposureBlockedByPermissionTenancy: true,
  issueCodes: deepFreeze(['BUILDER_SSOT_INVERSION_FORBIDDEN', 'BUILDER_PERMISSION_INTEGRATION_FORBIDDEN']),
});
export default SSOT_SECURITY_PERMISSION_CONTRACT;
