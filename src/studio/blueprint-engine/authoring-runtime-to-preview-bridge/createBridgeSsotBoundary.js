import { BLUEPRINT_CONTRACT_VERSION, REQUIRED_FUTURE_CHECKPOINT } from './bridgeRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';

/** SSOT / CERTIFICATION / MODULE boundary — certified blueprint stays canonical; bridge may do nothing real. */
export function createBridgeSsotBoundary() {
  return deepFreeze({
    kind: 'bridge-ssot-boundary',
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
    requiresFutureExplicitCertificationSlice: true,
    requiresHumanCheckpointBeforeCertification: true,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
  });
}

export default createBridgeSsotBoundary;
