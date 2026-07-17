import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * DRAFT IDENTITY ENFORCEMENT PLAN — plans strict, explicit draft-identity enforcement. Explicit draft id
 * required; single-draft fallback forbidden; missing/unknown/ambiguous ids fail closed. The upstream
 * runtime is NOT altered by this plan. Metadata only. @returns {Object}
 */
export function createDraftIdentityEnforcementPlan() {
  const core = {
    kind: 'bridge-draft-identity-enforcement-plan',
    strictDraftIdentityEnforcementPlanned: true,
    strictDraftIdentityEnforcementImplemented: false,
    explicitDraftIdRequired: true,
    singleDraftFallbackAllowed: false,
    missingDraftIdFailsClosed: true,
    unknownDraftIdFailsClosed: true,
    ambiguousDraftSelectionAllowed: false,
    runtimeAlteredByThisPlan: false,
  };
  return safeCloneGenericModel({ ...core, draftIdentityEnforcementPlanDigest: bridgePlanDigest(core) });
}

export default createDraftIdentityEnforcementPlan;
