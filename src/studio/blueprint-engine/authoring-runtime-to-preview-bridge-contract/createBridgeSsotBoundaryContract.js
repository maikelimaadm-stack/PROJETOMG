import { BLUEPRINT_CONTRACT_VERSION, REQUIRED_FUTURE_CHECKPOINT, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the SSOT BOUNDARY contract. The certified Blueprint Contract remains the canonical SSOT;
 * drafts/candidates are non-canonical; the future bridge may never certify/publish/register/generate a
 * module/overwrite the certified blueprint/bypass certification. Metadata only. @returns {Object}
 */
export function createBridgeSsotBoundaryContract() {
  const core = {
    kind: 'bridge-ssot-boundary-contract',
    canonicalSsot: 'certified-blueprint-contract',
    certifiedBlueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    certifiedBlueprintRemainsSsot: true,
    draftIsCanonical: false,
    candidateIsCanonical: false,
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
  return safeCloneGenericModel({ ...core, ssotBoundaryContractDigest: bridgeDigest(core) });
}

export default createBridgeSsotBoundaryContract;
