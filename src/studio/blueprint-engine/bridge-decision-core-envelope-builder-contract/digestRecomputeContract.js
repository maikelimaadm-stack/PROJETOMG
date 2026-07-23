import { SOURCE_DIGEST_FIELD } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Digest recompute-and-compare contract. Recompute over the extracted core; confirm == source digest; fail-closed. */
export const DIGEST_RECOMPUTE_CONTRACT = deepFreeze({
  kind: 'builder-digest-recompute-contract',
  digestField: SOURCE_DIGEST_FIELD,
  canonicalSerializer: 'stableSerialize (key-sorted, deterministic) — real Authoring Runtime helper',
  digestHelper: 'createDeterministicDigest (FNV-1a) — real Authoring Runtime helper',
  digestAlgorithm: 'FNV internal deterministic identity',
  digestPreimage: 'bridgeDecisionCore',
  recomputeRequiredBeforeEmission: true,
  exactDigestComparisonRequired: true,
  digestSynthesisAllowed: false, digestAliasAllowed: false, digestFallbackAllowed: false,
  cryptographicIntegrityProvided: false,
  tamperCategoriesDetected: deepFreeze([
    'targetDescriptor shallow', 'targetDescriptor deep', 'status', 'issues', 'source identity', 'version',
    'rollback/security booleans', 'array order', 'digest itself',
  ]),
  digestRecomputeImplemented: false,
});
export default DIGEST_RECOMPUTE_CONTRACT;
