import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './amendmentInput.js';
/** Deterministic diagnostics from a verification result. Pure; frozen. */
export function createAmendmentDiagnostics(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const v = isPlainObject(o.verification) ? o.verification : {};
  const blockers = Array.isArray(v.blockers) ? v.blockers : [];
  return deepFreeze({
    kind: 'amendment-diagnostics',
    ok: v.ok === true, amendmentOnly: v.amendmentOnly === true,
    runtimeImplemented: v.runtimeImplemented === true, builderImplemented: v.builderImplemented === true,
    bRecomputeInputResolvedByPlan: v.bRecomputeInputResolvedByPlan === true,
    bCoreEnvelopeBuilderOpen: v.bCoreEnvelopeBuilderOpen === true,
    readyForRuntimeImplementation: v.readyForRuntimeImplementation === true,
    blockerCount: blockers.length, firstBlockers: deepFreeze(blockers.slice(0, 12)),
    summary: v.ok === true
      ? 'ALIGNMENT AMENDMENT valid: Option A superseded, Option B selected, B-RECOMPUTE resolved at plan level, B-CORE-ENVELOPE-BUILDER open, runtime blocked.'
      : `ALIGNMENT AMENDMENT invalid: ${blockers.length} blocker(s).`,
  });
}
export default createAmendmentDiagnostics;
