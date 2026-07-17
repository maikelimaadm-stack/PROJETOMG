import { BLUEPRINT_CONTRACT_VERSION } from './authoringRuntimeConfig.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/** SSOT boundary — the certified blueprint stays canonical; drafts/candidates never do. Pure. */
export function createAuthoringRuntimeSsotBoundary() {
  const core = {
    kind: 'authoring-runtime-ssot-boundary',
    canonicalSsot: 'certified-blueprint-contract',
    certifiedBlueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    certifiedBlueprintRemainsSsot: true,
    draftIsCanonical: false,
    candidateIsCanonical: false,
    selfCertificationAllowed: false,
    authoringMayOverwriteCertifiedBlueprint: false,
    authoringMayBypassCertification: false,
    engineConsumedReadOnly: true,
    plannerConsumedReadOnly: true,
    previewSandboxConsumedReadOnly: true,
    secondSsotCreated: false,
  };
  return Object.freeze({ ...core, ssotBoundaryDigest: createDeterministicDigest(core) });
}

export default createAuthoringRuntimeSsotBoundary;
