import { CORE_ENVELOPE_READINESS_STATES } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeCoreEnvelopeInput.js';
/** Deterministic readiness decision. Ready for ENTERPRISE CONTRACT AUDIT; never ready for runtime here. */
export function createCoreEnvelopeReadinessDecision(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const bIdentityClosedByContract = o.bIdentityClosedByContract === true;
  const bRecomputeInputClosedByContract = o.bRecomputeInputClosedByContract === true;
  const contractFullyDefined = o.contractFullyDefined === true;
  const ok = blockers.length === 0 && contractFullyDefined;
  const readyForEnterpriseContractAudit = ok && bIdentityClosedByContract;
  const readiness = readyForEnterpriseContractAudit ? CORE_ENVELOPE_READINESS_STATES[0]
    : (blockers.length > 0 ? 'blocked' : 'needs_contract_fix');
  return deepFreeze({
    kind: 'core-envelope-readiness-decision',
    ok, readiness,
    bIdentityClosedByContract, bRecomputeInputClosedByContract,
    implementationPlanAlignmentRequired: true,
    readyForEnterpriseContractAudit,
    readyForImplementationPlanAlignment: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    blockers: deepFreeze([...blockers]), blockerCount: blockers.length,
  });
}
export default createCoreEnvelopeReadinessDecision;
