import { DIGEST_RECOMPUTE_CONTRACT, SAME_DECISION_ATOMICITY_CONTRACT, SOURCE_DIGEST_FIELD } from '../bridge-decision-core-envelope-builder-contract/index.js';
import { deepFreeze } from './deepFreeze.js';
/** Digest recompute + same-decision atomicity plan — uses the real deterministic helpers, preimage = core. */
export const DIGEST_RECOMPUTE_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-digest-recompute',
  canonicalSerializer: 'stableSerialize (real runtime helper)',
  digestHelper: 'createDeterministicDigest (real runtime helper, FNV-1a key-sorted)',
  digestField: SOURCE_DIGEST_FIELD,
  preimage: 'bridgeDecisionCore (exact allowlist, digest excluded)',
  recomputeRequiredBeforeEmission: DIGEST_RECOMPUTE_CONTRACT.recomputeRequiredBeforeEmission === true,
  exactComparisonRequired: DIGEST_RECOMPUTE_CONTRACT.exactDigestComparisonRequired === true,
  synthesisForbidden: true, fallbackForbidden: true, aliasForbidden: true,
  cryptographicIntegrityProvided: false,
  mismatchRejectsAtomically: true,
  tamperCoverage: deepFreeze(['every core field', 'deep target descriptor', 'arrays/order', 'digest', 'cross-decision mix']),
  digestRecomputeImplemented: false,
});
export const SAME_DECISION_ATOMICITY_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-same-decision-atomicity',
  digestAndCoreMustComeFromSameDecision: SAME_DECISION_ATOMICITY_CONTRACT.digestAndCoreMustComeFromSameDecision === true,
  crossDecisionMixingForbidden: SAME_DECISION_ATOMICITY_CONTRACT.crossDecisionMixingAllowed === false,
  coreReplacementForbidden: SAME_DECISION_ATOMICITY_CONTRACT.coreReplacementAllowed === false,
  digestReplacementForbidden: SAME_DECISION_ATOMICITY_CONTRACT.digestReplacementAllowed === false,
  partialCoreForbidden: true,
  atomicityImplemented: false,
});
export default DIGEST_RECOMPUTE_PLAN;
