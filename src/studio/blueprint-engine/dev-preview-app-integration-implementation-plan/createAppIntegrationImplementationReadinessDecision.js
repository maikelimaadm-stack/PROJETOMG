import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { APP_INTEGRATION_IMPLEMENTATION_PLAN_READINESS_STATES, appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Decides readiness of the plan. Ready ONLY for the plan itself; never for a real implementation
 * slice, App integration, real module generation, or production. Blocked on any blocker. Pure and
 * deterministic.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object}
 */
export function createAppIntegrationImplementationReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];
  const ready = blockers.length === 0;

  const core = {
    kind: 'app-integration-implementation-readiness-decision',
    readiness: ready ? 'studio_dev_preview_app_integration_implementation_plan_ready' : 'blocked',
    readyForAppIntegrationImplementationPlan: ready,
    readyForAppIntegrationImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    knownState: APP_INTEGRATION_IMPLEMENTATION_PLAN_READINESS_STATES.includes(ready ? 'studio_dev_preview_app_integration_implementation_plan_ready' : 'blocked'),
  };
  return safeCloneGenericModel({ ...core, readinessDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationImplementationReadinessDecision;
