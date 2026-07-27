import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './planInput.js';
/** Deterministic diagnostics from a verification result. Pure; frozen. */
export function createPlanDiagnostics(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const v = isPlainObject(o.verification) ? o.verification : {};
  const blockers = Array.isArray(v.blockers) ? v.blockers : [];
  return deepFreeze({
    kind: 'builder-implementation-plan-diagnostics',
    ok: v.ok === true, planOnly: v.planOnly === true,
    builderImplemented: v.builderImplemented === true,
    futureRuntimeSubtreeCreated: v.futureRuntimeSubtreeCreated === true,
    readyForEnterprisePlanAudit: v.readyForEnterprisePlanAudit === true,
    readyForBuilderImplementation: v.readyForBuilderImplementation === true,
    blockerCount: blockers.length, firstBlockers: deepFreeze(blockers.slice(0, 12)),
    summary: v.ok === true
      ? 'BUILDER IMPLEMENTATION PLAN valid: plan-only; consumes the audited Builder Contract (B-CORE-ENVELOPE-BUILDER closed-by-contract; identityVerified consumer-owned, ARCHITECTURE 1 final, no amendment); 22 phases; future builder absent; ready for the enterprise plan audit; builder implementation and consumer runtime blocked.'
      : `BUILDER IMPLEMENTATION PLAN invalid: ${blockers.length} blocker(s).`,
  });
}
export default createPlanDiagnostics;
