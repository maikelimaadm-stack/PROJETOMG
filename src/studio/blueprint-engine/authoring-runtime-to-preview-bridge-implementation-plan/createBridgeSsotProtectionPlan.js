import { BLUEPRINT_CONTRACT_VERSION, REQUIRED_FUTURE_CHECKPOINT, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * SSOT PROTECTION PLAN — the certified Blueprint Contract remains the canonical SSOT; drafts/candidates
 * are non-canonical; the future bridge may never certify/publish/register/generate a module/overwrite the
 * certified blueprint/bypass certification. Metadata only. @returns {Object}
 */
export function createBridgeSsotProtectionPlan() {
  const core = {
    kind: 'bridge-ssot-protection-plan',
    canonicalSsot: 'certified-blueprint-contract',
    certifiedBlueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    draftIsCanonical: false,
    candidateIsCanonical: false,
    certifiedBlueprintRemainsSsot: true,
    bridgeMayCertify: false,
    bridgeMayPublish: false,
    bridgeMayRegister: false,
    bridgeMayGenerateModule: false,
    bridgeMayWriteCertifiedBlueprint: false,
    bridgeMayBypassCertification: false,
    secondSsotCreated: false,
    requiresFutureExplicitCertificationSlice: true,
    requiresHumanCheckpointBeforeCertification: true,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
  };
  return safeCloneGenericModel({ ...core, ssotProtectionPlanDigest: bridgePlanDigest(core) });
}

export default createBridgeSsotProtectionPlan;
