import { deepFreeze } from './deepFreeze.js';
/** Digest semantics: recompute-and-compare, canonical serializer reuse, FNV internal-identity only. */
export const DIGEST_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-digest-contract',
  sourceDigestFields: ['sourceDigest', 'candidateDraftDigest'],
  futureConsumerDecisionDigestField: 'consumerDecisionDigest',
  serializer: 'stableSerialize', digestHelper: 'createDeterministicDigest', digestAlgorithm: 'fnv1a-32',
  digestValidationMode: 'recompute_and_compare', alternativeSerializerAllowed: false,
  cryptographicIntegrityProvided: false, authenticityProvided: false, tamperProofProvided: false,
  digestMayAuthorizeCertification: false, digestMayAuthorizeModuleGeneration: false, digestMayAuthorizeProductExposure: false,
  cryptographicDigestRequiredBeforeCertification: true, cryptographicDigestRequiredBeforeProduction: true,
  // The target descriptor has no own digest field today.
  bridgeDecisionDigestRemainsAvailableUpstreamIdentity: true,
  targetDescriptorDigestNotCurrentlyPresent: true, futureConsumerMustNotInventIt: true,
});
export default DIGEST_CONTRACT;
