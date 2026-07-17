import {
  BRIDGE_IMPLEMENTATION_PLAN_NAME, BRIDGE_IMPLEMENTATION_PLAN_VERSION, BRIDGE_IMPLEMENTATION_PLAN_MODE,
  BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES, bridgePlanDigest,
} from './bridgeImplementationPlanConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Safe, fail-closed fallback for an invalid/missing/fallback bridge contract. Never throws; authorizes
 * nothing. Pure. @param {Object} [options] @returns {Object}
 */
export function createBridgeImplementationPlanFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_bridge_contract';
  const core = {
    kind: 'studio-authoring-runtime-to-preview-bridge-implementation-plan',
    bridgeImplementationPlanName: BRIDGE_IMPLEMENTATION_PLAN_NAME,
    bridgeImplementationPlanVersion: BRIDGE_IMPLEMENTATION_PLAN_VERSION,
    mode: BRIDGE_IMPLEMENTATION_PLAN_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForBridgeImplementationPlan: false,
    readyForBridgeImplementationSlice: false,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    blockers: ['invalid_or_missing_bridge_contract'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, overallDigest: bridgePlanDigest(core) });
}

export default createBridgeImplementationPlanFallback;
