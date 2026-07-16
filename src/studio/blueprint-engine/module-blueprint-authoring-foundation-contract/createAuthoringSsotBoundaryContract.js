import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { BLUEPRINT_CONTRACT_VERSION, authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * The SSOT BOUNDARY CONTRACT — the heart of this foundation's safety model.
 *
 * Declares, as metadata, the single-source-of-truth boundary:
 *   - The CERTIFIED Blueprint Contract is the canonical SSOT.
 *   - An authoring DRAFT is TEMPORARY and NON-CANONICAL.
 *   - The Blueprint Engine and Module Reference Planner are READ-ONLY consumers.
 *   - The Preview Sandbox is a SYNTHETIC handoff destination.
 *
 * A draft may NEVER become the SSOT, self-certify, overwrite the certified contract, or be treated as
 * canonical. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createAuthoringSsotBoundaryContract() {
  const core = {
    kind: 'authoring-ssot-boundary-contract',
    canonicalSsot: 'certified-blueprint-contract',
    certifiedBlueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
    certifiedBlueprintRemainsSsot: true,
    draftIsCanonical: false,
    draftIsTemporary: true,
    draftIsNonCanonical: true,
    draftCanBecomeSsot: false,
    draftSelfCertifies: false,
    draftOverwritesCertifiedContract: false,
    blueprintEngineIsReadOnlyConsumer: true,
    moduleReferencePlannerIsReadOnlyConsumer: true,
    previewSandboxIsSyntheticDestination: true,
    ssotPreserved: true,
  };
  return safeCloneGenericModel({ ...core, ssotBoundaryDigest: authoringFoundationDigest(core) });
}

export default createAuthoringSsotBoundaryContract;
