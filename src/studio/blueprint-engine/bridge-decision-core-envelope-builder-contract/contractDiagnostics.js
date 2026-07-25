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
      ? 'BUILDER CONTRACT valid: contract-only; B-CORE-ENVELOPE-BUILDER CLOSED BY CONTRACT; B-CORE-ENVELOPE-VERIFICATION-STATE NOT_A_BLOCKER (identityVerified is consumer-owned; builder verification recorded in the builder decision; immutable pre-consumer envelope stays false; no amendment required); technically ready for the Builder Implementation Plan audit; execution not authorized here; builder implementation and runtime blocked.'
      : `BUILDER CONTRACT invalid: ${blockers.length} blocker(s).`,
  });
}
export default createBuilderContractDiagnostics;
