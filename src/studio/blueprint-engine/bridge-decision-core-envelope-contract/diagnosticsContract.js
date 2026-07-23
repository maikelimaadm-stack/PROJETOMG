import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeCoreEnvelopeInput.js';
/** Deterministic diagnostics summary from a verification result. Pure; frozen. */
export function createCoreEnvelopeDiagnostics(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const v = isPlainObject(o.verification) ? o.verification : {};
  const blockers = Array.isArray(v.blockers) ? v.blockers : [];
  return deepFreeze({
    kind: 'core-envelope-contract-diagnostics',
    ok: v.ok === true, contractOnly: v.contractOnly === true,
    coreEnvelopeBuilderImplemented: v.coreEnvelopeBuilderImplemented === true,
    bIdentityClosedByContract: v.bIdentityClosedByContract === true,
    bRecomputeInputClosedByContract: v.bRecomputeInputClosedByContract === true,
    readyForRuntimeImplementation: v.readyForRuntimeImplementation === true,
    blockerCount: blockers.length, firstBlockers: deepFreeze(blockers.slice(0, 12)),
    summary: v.ok === true
      ? 'CORE ENVELOPE CONTRACT valid: contract-only, B-RECOMPUTE-INPUT closed by contract, runtime blocked pending plan alignment.'
      : `CORE ENVELOPE CONTRACT invalid: ${blockers.length} blocker(s).`,
  });
}
export default createCoreEnvelopeDiagnostics;
