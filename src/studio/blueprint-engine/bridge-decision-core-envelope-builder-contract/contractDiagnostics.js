import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './builderInput.js';
/** Deterministic diagnostics from a verification result. Pure; frozen. */
export function createBuilderContractDiagnostics(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const v = isPlainObject(o.verification) ? o.verification : {};
  const blockers = Array.isArray(v.blockers) ? v.blockers : [];
  return deepFreeze({
    kind: 'builder-contract-diagnostics',
    ok: v.ok === true, contractOnly: v.contractOnly === true,
    builderImplemented: v.builderImplemented === true,
    bCoreEnvelopeBuilderClosedByContract: v.bCoreEnvelopeBuilderClosedByContract === true,
    bCoreEnvelopeVerificationStateOpen: v.bCoreEnvelopeVerificationStateOpen === true,
    readyForBuilderImplementationPlan: v.readyForBuilderImplementationPlan === true,
    readyForRuntimeImplementation: v.readyForRuntimeImplementation === true,
    blockerCount: blockers.length, firstBlockers: deepFreeze(blockers.slice(0, 12)),
    summary: v.ok === true
      ? 'BUILDER CONTRACT valid: contract-only; B-CORE-ENVELOPE-BUILDER sub-contracts defined; B-CORE-ENVELOPE-VERIFICATION-STATE OPEN (identityVerified invariant conflict); builder implementation plan NOT authorized; runtime blocked.'
      : `BUILDER CONTRACT invalid: ${blockers.length} blocker(s).`,
  });
}
export default createBuilderContractDiagnostics;
