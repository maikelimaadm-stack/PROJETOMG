import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { BLUEPRINT_CONTRACT_VERSION, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * SSOT protection PLAN — plans protection of the single source of truth: the certified Blueprint
 * Contract stays canonical; drafts and candidates are non-canonical; authoring may never overwrite the
 * certified blueprint nor bypass certification. Upstream consumed read-only. Metadata only.
 * @returns {Object}
 */
export function createSsotProtectionPlan() {
  const core = {
    kind: 'authoring-ssot-protection-plan',
    ssotProtectionPlanned: true,
    canonicalSsot: 'certified-blueprint-contract',
    certifiedBlueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    certifiedBlueprintRemainsSsot: true,
    draftIsCanonical: false,
    candidateIsCanonical: false,
    authoringMayOverwriteCertifiedBlueprint: false,
    authoringMayBypassCertification: false,
    engineConsumedReadOnly: true,
    plannerConsumedReadOnly: true,
    previewSandboxConsumedReadOnly: true,
  };
  return safeCloneGenericModel({ ...core, ssotProtectionPlanDigest: authoringPlanDigest(core) });
}

export default createSsotProtectionPlan;
