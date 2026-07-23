import { BUILDER_READINESS_STATES } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './builderInput.js';
/** Deterministic readiness. Ready for ENTERPRISE CONTRACT AUDIT; never ready for builder-plan/impl/runtime here. */
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
    // Builder Implementation Plan authorized ONLY if the builder blocker is closed (i.e., verification state closed).
    readyForBuilderImplementationPlan: false,
    readyForBuilderImplementation: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    blockers: deepFreeze([...blockers]), blockerCount: blockers.length,
  });
}
export default createBuilderContractReadinessDecision;
