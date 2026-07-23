import { REAL_DECISION_DIGEST_PREIMAGE_FIELDS, REQUIRED_CORE_FIELDS, CORE_FIELD_COUNT } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * B-RECOMPUTE-INPUT closure at CONTRACT level. The v2 core carries EXACTLY the real preimage (missing=0, extra=0),
 * so a future consumer can recompute the digest fully. The live proof (createDeterministicDigest(core) === real
 * digest; stableSerialize(core) === stableSerialize(decision − digest)) is executed by the test and the gate.
 * Runtime stays blocked: Implementation Plan alignment is still required.
 */
const missing = REQUIRED_CORE_FIELDS.filter((f) => !REAL_DECISION_DIGEST_PREIMAGE_FIELDS.includes(f));
const extra = REAL_DECISION_DIGEST_PREIMAGE_FIELDS.filter((f) => !REQUIRED_CORE_FIELDS.includes(f));
export const BLOCKER_CLOSURE_CONTRACT = deepFreeze({
  kind: 'core-envelope-b-recompute-input-closure-contract',
  blockerId: 'B-RECOMPUTE-INPUT',
  bRecomputeInputRootCauseConfirmed: true,
  requiredPreimageFieldsCaptured: true,
  requiredPreimageFieldCount: CORE_FIELD_COUNT,
  coreFieldCount: REQUIRED_CORE_FIELDS.length,
  allRequiredPreimageFieldsPresentInCore: missing.length === 0,
  missingPreimageFieldCount: missing.length,
  extraPreimageFieldCount: extra.length,
  fullDigestRecomputationPossibleByContract: missing.length === 0 && extra.length === 0,
  bRecomputeInputClosedByContract: missing.length === 0 && extra.length === 0,
  liveProofRequired: 'createDeterministicDigest(core) === real bridgeDecisionDigest (test + gate, multi-seed)',
  // Runtime still blocked.
  implementationPlanAlignmentRequired: true,
  readyForRuntimeImplementation: false,
});
export default BLOCKER_CLOSURE_CONTRACT;
