import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_IMPLEMENTATION_PLAN_READINESS_STATES, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Decides readiness of the plan. Ready ONLY for the plan itself; never for a real authoring runtime
 * implementation slice, UI, permission/tenancy integration, product exposure, module generation, or
 * production. Blocked on any blocker. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object}
 */
export function createAuthoringImplementationReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];
  const ready = blockers.length === 0;
  const readiness = ready ? 'studio_module_blueprint_authoring_implementation_plan_ready' : 'blocked';

  const core = {
    kind: 'authoring-implementation-readiness-decision',
    readiness,
    readyForAuthoringImplementationPlan: ready,
    readyForAuthoringRuntimeImplementationSlice: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundation: true,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    knownState: AUTHORING_IMPLEMENTATION_PLAN_READINESS_STATES.includes(readiness),
  };
  return safeCloneGenericModel({ ...core, readinessDigest: authoringPlanDigest(core) });
}

export default createAuthoringImplementationReadinessDecision;
