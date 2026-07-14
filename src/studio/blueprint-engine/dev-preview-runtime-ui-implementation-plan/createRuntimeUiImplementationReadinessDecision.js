import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_UI_IMPLEMENTATION_PLAN_READINESS_STATES,
  uiPlanDigest,
} from './runtimeUiImplementationPlanConfig.js';

/**
 * Decides readiness of the plan. Ready ONLY for the plan itself; never for a real implementation
 * slice, route/placement integration, real module generation, or production. Blocked on any
 * blocker. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string[]} [options.blockers]
 * @param {string[]} [options.warnings]
 * @returns {Object}
 */
export function createRuntimeUiImplementationReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];
  const ready = blockers.length === 0;

  const core = {
    kind: 'runtime-ui-implementation-readiness-decision',
    readiness: ready
      ? 'studio_dev_preview_runtime_ui_implementation_plan_ready'
      : 'blocked',
    readyForRuntimeUiImplementationPlan: ready,
    readyForRuntimeUiImplementationSlice: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    knownState: RUNTIME_UI_IMPLEMENTATION_PLAN_READINESS_STATES.includes(
      ready ? 'studio_dev_preview_runtime_ui_implementation_plan_ready' : 'blocked',
    ),
  };
  return safeCloneGenericModel({ ...core, readinessDigest: uiPlanDigest(core) });
}

export default createRuntimeUiImplementationReadinessDecision;
