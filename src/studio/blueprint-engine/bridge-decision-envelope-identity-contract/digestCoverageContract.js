import { DECISION_DIGEST_PREIMAGE_FIELDS } from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Digest coverage contract. The real bridgeDecisionDigest is FNV-1a over the decision core which INCLUDES the
 * full targetDescriptor (and status/issues/source identity). Proven upstream: tampering the targetDescriptor
 * changes the digest. Therefore the envelope {digest, descriptor} can bind provenance via recompute-and-compare,
 * and B-IDENTITY is closable at contract level. FNV internal-only; no cryptographic claim.
 */
export const DIGEST_COVERAGE_CONTRACT = deepFreeze({
  kind: 'envelope-digest-coverage-contract',
  bridgeDecisionDigestField: 'bridgeDecisionDigest',
  digestAlgorithm: 'fnv1a-32', digestPurpose: 'deterministic_internal_identity',
  canonicalSerializer: 'stableSerialize', digestHelper: 'createDeterministicDigest',
  decisionDigestPreimageFields: [...DECISION_DIGEST_PREIMAGE_FIELDS],
  targetDescriptorCoveredByDigest: true, issuesCoveredByDigest: true, statusCoveredByDigest: true,
  sourceIdentityCoveredByDigest: true,
  cryptographicIntegrityProvided: false, authenticityProvided: false, tamperProofProvided: false,
  bIdentityRemainsOpen: false, bIdentityClosedByContract: true, readyForImplementationPlan: false,
});
export default DIGEST_COVERAGE_CONTRACT;
