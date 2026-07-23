import { DIGEST_FIELD } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Digest semantics: bridgeDecisionDigest = createDeterministicDigest(stableSerialize(bridgeDecisionCore)).
 * FNV-1a internal identity only — NOT cryptographic/authenticity/tamper-proof. recompute_and_compare. The
 * live equivalence (createDeterministicDigest(core) === real digest) is proven by the test and the gate.
 */
export const DIGEST_SEMANTICS_CONTRACT = deepFreeze({
  kind: 'core-envelope-digest-semantics-contract',
  digestField: DIGEST_FIELD,
  canonicalSerializer: 'stableSerialize (key-sorted, deterministic) — real Authoring Runtime helper',
  digestHelper: 'createDeterministicDigest (FNV-1a) — real Authoring Runtime helper',
  digestPreimage: 'bridgeDecisionCore (complete)',
  recomputeMode: 'recompute_and_compare',
  cryptographicIntegrityProvided: false,
  authenticityProvided: false,
  tamperProofProvided: false,
  keyInsertionOrderInvariant: true,
  arrayOrderSensitive: true,
  tamperCategoriesDetected: deepFreeze([
    'target shallow', 'target deep', 'status', 'issues', 'source identity', 'version', 'security/rollback', 'array order',
  ]),
  digestRecomputeExecuted: false,
});
export default DIGEST_SEMANTICS_CONTRACT;
