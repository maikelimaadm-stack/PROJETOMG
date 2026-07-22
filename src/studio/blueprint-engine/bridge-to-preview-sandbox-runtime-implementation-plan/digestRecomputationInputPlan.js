import {
  REAL_DECISION_DIGEST_PREIMAGE_FIELDS, REAL_ENVELOPE_FIELDS, SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION,
} from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * DIGEST RECOMPUTATION INPUT PLAN — the analysis that answers blocker B-RECOMPUTE-INPUT.
 *
 * The merged Bridge Decision Envelope Identity Contract (#488) PROVED that the real `bridgeDecisionDigest`
 * covers the full 32-field decision preimage (`DECISION_DIGEST_PREIMAGE_FIELDS`), which includes the entire
 * `targetDescriptor`. This is coverage. It is NOT the same as: "the future runtime, given ONLY the merged
 * 17-field envelope, has enough inputs to RECOMPUTE that digest." This module proves — from the real arrays,
 * not from prose — exactly which preimage fields the current envelope carries and which it does not.
 *
 * PLAN ONLY. Nothing is recomputed here. This is the honest, non-silent gap analysis the spec (§13) demands.
 */

// The real 32-field digest preimage (from the contract, read-only).
const PREIMAGE_FIELDS = [...REAL_DECISION_DIGEST_PREIMAGE_FIELDS];

// The exact, explicit mapping from an envelope field to the decision-preimage field it carries. Only these three
// envelope fields carry decision-preimage data; everything else in the envelope is metadata/security flags that
// are NOT part of the digested decision preimage. This map is deliberately conservative and explicit — no silent
// widening.
export const ENVELOPE_TO_DECISION_PREIMAGE_MAP = deepFreeze({
  targetDescriptor: 'targetDescriptor',
  sourceBridgeDecisionStatus: 'status',
  sourceBridgeRuntimeVersion: 'bridgeVersion',
});

const AVAILABLE_PREIMAGE_FIELDS = Object.freeze(
  Object.values(ENVELOPE_TO_DECISION_PREIMAGE_MAP).filter((f) => PREIMAGE_FIELDS.includes(f)).sort(),
);
const MISSING_PREIMAGE_FIELDS = Object.freeze(
  PREIMAGE_FIELDS.filter((f) => !AVAILABLE_PREIMAGE_FIELDS.includes(f)).sort(),
);

export const DIGEST_RECOMPUTATION_INPUT_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-digest-recomputation-input-plan',
  sourceContractVersion: SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION,
  algorithm: deepFreeze([
    '1. validate envelope shape',
    '2. extract bridgeDecisionDigest',
    '3. extract targetDescriptor',
    '4. reconstruct expected bridgeDecision core from the envelope-supported source',
    '5. stableSerialize canonical preimage',
    '6. createDeterministicDigest (FNV-1a, internal identity only)',
    '7. compare exact digest',
    '8. reject mismatch',
  ]),
  // Real, computed gap — the numbers come from the arrays, so they cannot drift from the contracts.
  requiredDecisionPreimageFields: PREIMAGE_FIELDS,
  requiredDecisionPreimageFieldCount: PREIMAGE_FIELDS.length, // 32
  envelopeFields: [...REAL_ENVELOPE_FIELDS],
  envelopeFieldCount: REAL_ENVELOPE_FIELDS.length, // 17
  envelopeToDecisionPreimageMap: ENVELOPE_TO_DECISION_PREIMAGE_MAP,
  preimageFieldsAvailableFromEnvelope: AVAILABLE_PREIMAGE_FIELDS, // targetDescriptor, status, bridgeVersion
  preimageFieldsAvailableCount: AVAILABLE_PREIMAGE_FIELDS.length, // 3
  preimageFieldsMissingFromEnvelope: MISSING_PREIMAGE_FIELDS,
  preimageFieldsMissingCount: MISSING_PREIMAGE_FIELDS.length, // 29
  // The decisive fact: with the CURRENTLY-CONTRACTED envelope, the runtime CANNOT recompute the digest.
  envelopeFieldsSufficientForRecompute: MISSING_PREIMAGE_FIELDS.length === 0,
  implementationCannotProceedUntilDigestRecomputationInputsAreComplete: true,
  // FNV is an internal identity function, never claimed cryptographic.
  digestHelper: 'createDeterministicDigest (FNV-1a, key-sorted) — internal identity only, NOT cryptographic',
});

export default DIGEST_RECOMPUTATION_INPUT_PLAN;
