import { PLAN_READINESS_STATES } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './planInput.js';
/**
 * Deterministic readiness. Ready for the ENTERPRISE PLAN AUDIT once the plan is fully defined and the Builder
 * Contract is closed-by-contract. Builder implementation and consumer runtime remain unavailable.
 */
export function createPlanReadinessDecision(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const planFullyDefined = o.planFullyDefined === true;
  const bCoreEnvelopeBuilderClosedByContract = o.bCoreEnvelopeBuilderClosedByContract === true;
  const ok = blockers.length === 0 && planFullyDefined && bCoreEnvelopeBuilderClosedByContract;
  const readiness = ok ? PLAN_READINESS_STATES[0] : (blockers.length > 0 ? 'blocked' : 'needs_plan_fix');
  return deepFreeze({
    kind: 'builder-implementation-plan-readiness-decision',
    ok, readiness,
    builderImplementationPlanCreated: planFullyDefined,
    bRecomputeInputResolvedByPlan: true,
    bCoreEnvelopeVerificationStateOpen: false,
    bCoreEnvelopeBuilderClosedByContract,
    bCoreEnvelopeBuilderResolvedByPlan: bCoreEnvelopeBuilderClosedByContract,
    readyForEnterprisePlanAudit: ok,
    readyForBuilderImplementation: false,
    readyForConsumerRuntimeImplementation: false,
    blockers: deepFreeze([...blockers]), blockerCount: blockers.length,
  });
}
export default createPlanReadinessDecision;
