import { AMENDMENT_READINESS_STATES } from './amendmentConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './amendmentInput.js';
/** Deterministic readiness decision. Ready for ENTERPRISE ALIGNMENT AUDIT; never ready for runtime/builder here. */
export function createAmendmentReadinessDecision(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const amendmentFullyDefined = o.amendmentFullyDefined === true;
  const bRecomputeInputResolvedByPlan = o.bRecomputeInputResolvedByPlan === true;
  const bCoreEnvelopeBuilderOpen = o.bCoreEnvelopeBuilderOpen === true;
  const ok = blockers.length === 0 && amendmentFullyDefined && bRecomputeInputResolvedByPlan;
  const readyForEnterpriseAlignmentAudit = ok;
  const readiness = readyForEnterpriseAlignmentAudit ? AMENDMENT_READINESS_STATES[0]
    : (blockers.length > 0 ? 'blocked' : 'needs_amendment_fix');
  return deepFreeze({
    kind: 'amendment-readiness-decision',
    ok, readiness,
    bRecomputeInputResolvedByPlan,
    bCoreEnvelopeBuilderOpen,
    implementationPlanAlignedToCoreEnvelopeV2: true,
    readyForEnterpriseAlignmentAudit,
    readyForCoreEnvelopeBuilderContract: false, // gated to external post-merge recommendation
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    blockers: deepFreeze([...blockers]), blockerCount: blockers.length,
  });
}
export default createAmendmentReadinessDecision;
