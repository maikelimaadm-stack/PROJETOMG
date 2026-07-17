import { BRIDGE_IMPLEMENTATION_PLAN_READINESS_STATES, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Decides readiness of the bridge implementation plan. Ready for the plan itself (and thereby for the
 * FABLE 5 pre-implementation enterprise checkpoint); never for a real bridge implementation slice,
 * preview mount, UI, permission/tenancy integration, product exposure, module generation, certification
 * or production. Pure. @param {Object} [options] @returns {Object}
 */
export function createBridgeImplementationReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];
  const ready = blockers.length === 0;
  const readiness = ready ? 'studio_authoring_runtime_to_preview_bridge_implementation_plan_ready' : 'blocked';
  const core = {
    kind: 'bridge-implementation-readiness-decision',
    readiness,
    readyForBridgeImplementationPlan: ready,
    readyForBridgeImplementationSlice: false,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    knownState: BRIDGE_IMPLEMENTATION_PLAN_READINESS_STATES.includes(readiness),
  };
  return safeCloneGenericModel({ ...core, readinessDigest: bridgePlanDigest(core) });
}

export default createBridgeImplementationReadinessDecision;
