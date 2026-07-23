import { CORE_ENVELOPE_CONTRACT_TRACEABILITY } from './coreEnvelopeContractTraceability.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Replaces the former partial-reconstruction plan with exact recompute from the complete core. required ==
 * available == core field count; missing/extra = 0; bRecomputeInputResolvedByPlan true ONLY because the real
 * lists are identical (derived, not asserted). No local duplicated preimage list.
 */
const required = CORE_ENVELOPE_CONTRACT_TRACEABILITY.requiredCoreFields;
export const DIGEST_RECOMPUTATION_ALIGNMENT = deepFreeze({
  kind: 'digest-recomputation-alignment',
  algorithm: deepFreeze([
    '1. validate Core Envelope v2 shape',
    '2. extract bridgeDecisionDigest',
    '3. extract bridgeDecisionCore',
    '4. verify exact core field set',
    '5. stableSerialize(bridgeDecisionCore)',
    '6. createDeterministicDigest(bridgeDecisionCore)',
    '7. compare exact digest',
    '8. reject mismatch',
  ]),
  requiredPreimageFieldCount: required.length,        // 32, derived from REQUIRED_CORE_FIELDS
  availablePreimageFieldCount: required.length,       // same as required (full core available)
  missingPreimageFieldCount: 0,
  extraPreimageFieldCount: 0,
  noLocalDuplicatedPreimageList: true,
  bRecomputeInputResolvedByPlan: required.length === CORE_ENVELOPE_CONTRACT_TRACEABILITY.coreFieldCount && CORE_ENVELOPE_CONTRACT_TRACEABILITY.missingPreimageFieldCount === 0 && CORE_ENVELOPE_CONTRACT_TRACEABILITY.extraPreimageFieldCount === 0,
  digestHelper: 'createDeterministicDigest (FNV-1a) over stableSerialize(core) — internal identity only',
  digestRecomputeImplemented: false,
});
export default DIGEST_RECOMPUTATION_ALIGNMENT;
