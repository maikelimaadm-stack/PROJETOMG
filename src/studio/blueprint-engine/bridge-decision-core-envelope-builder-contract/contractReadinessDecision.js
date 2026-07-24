import { BUILDER_READINESS_STATES } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './builderInput.js';
/**
 * Deterministic readiness. Ready for the Builder Implementation Plan AUDIT once the builder blocker is closed by
 * contract (verification-state is NOT_A_BLOCKER). Builder implementation and runtime remain unavailable here.
 */
export function createBuilderContractReadinessDecision(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const contractFullyDefined = o.contractFullyDefined === true;
  const bCoreEnvelopeBuilderClosedByContract = o.bCoreEnvelopeBuilderClosedByContract === true;
  const bCoreEnvelopeVerificationStateOpen = o.bCoreEnvelopeVerificationStateOpen === true;
  const ok = blockers.length === 0 && contractFullyDefined;
  const readyForEnterpriseContractAudit = ok;
  const readiness = readyForEnterpriseContractAudit ? BUILDER_READINESS_STATES[0]
    : (blockers.length > 0 ? 'blocked' : 'needs_contract_fix');
  return deepFreeze({
    kind: 'builder-contract-readiness-decision',
    ok, readiness,
    bCoreEnvelopeBuilderClosedByContract,
    bCoreEnvelopeVerificationStateOpen,
    builderImplementationPlanRequired: true,
    readyForEnterpriseContractAudit,
    // The Builder Implementation Plan is the next slice once the builder blocker is closed by contract and the
    // verification-state is not open. This readiness is TECHNICAL — external authorization is still gated by the
    // manual gate (authorizesBuilderImplementationPlan stays false in this correction PR).
    readyForBuilderImplementationPlan: ok && bCoreEnvelopeBuilderClosedByContract && !bCoreEnvelopeVerificationStateOpen,
    readyForBuilderImplementation: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    blockers: deepFreeze([...blockers]), blockerCount: blockers.length,
  });
}
export default createBuilderContractReadinessDecision;
