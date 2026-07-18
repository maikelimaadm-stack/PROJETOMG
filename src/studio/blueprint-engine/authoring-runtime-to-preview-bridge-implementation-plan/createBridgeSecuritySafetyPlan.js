import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * SECURITY / SAFETY PLAN — everything real is disallowed; the future bridge remains synthetic/headless/
 * metadata-only. Aggregates the forbidden-capability allowances (all false). @returns {Object}
 */
export function createBridgeSecuritySafetyPlan() {
  const allowances = {
    networkAllowed: false,
    storageAllowed: false,
    filesystemWritesAllowed: false,
    backendAllowed: false,
    prismaAllowed: false,
    realDataAllowed: false,
    productExposureAllowed: false,
    previewMountAllowed: false,
    appTouchAllowed: false,
    routeCreationAllowed: false,
    menuCreationAllowed: false,
    moduleGenerationAllowed: false,
    certificationAllowed: false,
  };
  const anyForbiddenSideEffect = Object.values(allowances).some((v) => v === true);
  const core = {
    kind: 'bridge-security-safety-plan',
    anyForbiddenSideEffect,
    anyRealAllowed: anyForbiddenSideEffect,
    reversibleByNonConsumption: true,
    headless: true,
    metadataOnly: true,
    allowances,
    allowanceCount: Object.keys(allowances).length,
  };
  return safeCloneGenericModel({ ...core, securitySafetyPlanDigest: bridgePlanDigest(core) });
}

export default createBridgeSecuritySafetyPlan;
