import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * The CERTIFICATION CANDIDATE HANDOFF CONTRACT — describes how a validated authoring draft would, in a
 * future and SEPARATELY-APPROVED slice, produce a `certificationCandidate` for HUMAN review. Metadata
 * only.
 *
 * Critical SSOT invariant: producing a candidate is NOT certification. The draft can NEVER
 * self-certify, NEVER overwrite the certified blueprint contract, NEVER register a module, and NEVER
 * publish. A candidate is inert data handed to a human-gated certification flow that this layer does
 * not implement and that requires the future enterprise checkpoint. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createCertificationCandidateHandoffContract() {
  const core = {
    kind: 'authoring-certification-candidate-handoff-contract',
    candidateKind: 'blueprint_certification_candidate',
    candidateCreated: false,
    producesCandidate: true,
    candidateIsCertification: false,
    certified: false,
    canonical: false,
    candidateIsCanonical: false,
    readyForCertification: false,
    requiresFutureExplicitSlice: true,
    draftSelfCertifies: false,
    overwritesCertifiedContract: false,
    registersModule: false,
    generatesFiles: false,
    publishes: false,
    requiresHumanReview: true,
    requiresFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    handoffImplemented: false,
    inertData: true,
    reversibleByNonConsumption: true,
  };
  return safeCloneGenericModel({ ...core, certificationCandidateDigest: authoringFoundationDigest(core) });
}

export default createCertificationCandidateHandoffContract;
