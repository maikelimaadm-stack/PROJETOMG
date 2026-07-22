import { PLAN_READINESS_STATES } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './planInput.js';

/**
 * Deterministic PLAN readiness decision. Pure; frozen. The plan is ready for ENTERPRISE PLAN AUDIT once it is
 * fully defined with no blockers — but it is NEVER ready for runtime implementation while B-RECOMPUTE-INPUT is
 * unresolved. @param {Object} [options] @returns {Object}
 */
export function createPlanReadinessDecision(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const bIdentityClosedByContract = o.bIdentityClosedByContract === true;
  const bRecomputeInputResolvedByPlan = o.bRecomputeInputResolvedByPlan === true;
  const planFullyDefined = o.planFullyDefined === true;

  const ok = blockers.length === 0 && planFullyDefined;
  const readyForEnterprisePlanAudit = ok && bIdentityClosedByContract;
  // Runtime is authorized ONLY when the plan is ready AND B-RECOMPUTE-INPUT is resolved by an available contract.
  const readyForRuntimeImplementation = readyForEnterprisePlanAudit && bRecomputeInputResolvedByPlan;

  const readiness = readyForEnterprisePlanAudit
    ? PLAN_READINESS_STATES[0]
    : (blockers.length > 0 ? 'blocked' : 'needs_plan_fix');

  return deepFreeze({
    kind: 'bridge-to-preview-sandbox-runtime-implementation-plan-readiness-decision',
    ok,
    readiness,
    readyForEnterprisePlanAudit,
    readyForRuntimeImplementation,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    bIdentityClosedByContract,
    bRecomputeInputResolvedByPlan,
    blockers: deepFreeze([...blockers]),
    blockerCount: blockers.length,
  });
}

export default createPlanReadinessDecision;
