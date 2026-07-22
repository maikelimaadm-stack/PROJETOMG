import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './planInput.js';

/**
 * Deterministic PLAN diagnostics summary derived from a verification result. Pure; frozen.
 * @param {Object} [options] @param {Object} [options.verification] @returns {Object}
 */
export function createPlanDiagnostics(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const v = isPlainObject(o.verification) ? o.verification : {};
  const blockers = Array.isArray(v.blockers) ? v.blockers : [];
  return deepFreeze({
    kind: 'bridge-to-preview-sandbox-runtime-implementation-plan-diagnostics',
    ok: v.ok === true,
    planOnly: v.planOnly === true,
    runtimeImplemented: v.runtimeImplemented === true,
    executeImplemented: v.executeImplemented === true,
    previewMounted: v.previewMounted === true,
    productExposed: v.productExposed === true,
    bIdentityClosedByContract: v.bIdentityClosedByContract === true,
    bRecomputeInputResolvedByPlan: v.bRecomputeInputResolvedByPlan === true,
    readyForRuntimeImplementation: v.readyForRuntimeImplementation === true,
    blockerCount: blockers.length,
    firstBlockers: deepFreeze(blockers.slice(0, 12)),
    summary: v.ok === true
      ? 'PLAN valid: plan-only, B-IDENTITY closed by contract, B-RECOMPUTE-INPUT open, runtime not authorized.'
      : `PLAN invalid: ${blockers.length} blocker(s).`,
  });
}

export default createPlanDiagnostics;
