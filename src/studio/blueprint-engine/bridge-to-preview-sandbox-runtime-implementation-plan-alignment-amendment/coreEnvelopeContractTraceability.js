import {
  CORE_ENVELOPE_CONTRACT_VERSION, CORE_ENVELOPE_KIND, CORE_ENVELOPE_VERSION_TAG, REAL_DECISION_DIGEST_PREIMAGE_FIELDS,
  REQUIRED_CORE_FIELDS, CORE_ENVELOPE_FIELDS, CORE_FIELD_COUNT, BLOCKER_CLOSURE_CONTRACT, SELECTED_ARCHITECTURE,
  createStudioBridgeDecisionCoreEnvelopeContract,
} from '../bridge-decision-core-envelope-contract/index.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Captures the REAL merged Core Envelope v2 contract (#490) READ-ONLY — version, kind, real preimage/core fields,
 * closure state (missing 0 / extra 0) and manifest digest. No value invented.
 */
const CORE = createStudioBridgeDecisionCoreEnvelopeContract();
export const CORE_ENVELOPE_CONTRACT_TRACEABILITY = deepFreeze({
  kind: 'core-envelope-contract-traceability',
  coreEnvelopeContractVersion: CORE_ENVELOPE_CONTRACT_VERSION,
  coreEnvelopeKind: CORE_ENVELOPE_KIND,
  coreEnvelopeVersionTag: CORE_ENVELOPE_VERSION_TAG, // v2
  realDecisionDigestPreimageFields: [...REAL_DECISION_DIGEST_PREIMAGE_FIELDS],
  requiredCoreFields: [...REQUIRED_CORE_FIELDS],
  coreEnvelopeFields: [...CORE_ENVELOPE_FIELDS],
  coreFieldCount: CORE_FIELD_COUNT, // 32
  bRecomputeClosureState: BLOCKER_CLOSURE_CONTRACT.bRecomputeInputClosedByContract ? 'CLOSED_BY_CONTRACT' : 'OPEN',
  missingPreimageFieldCount: BLOCKER_CLOSURE_CONTRACT.missingPreimageFieldCount, // 0
  extraPreimageFieldCount: BLOCKER_CLOSURE_CONTRACT.extraPreimageFieldCount, // 0
  implementationPlanAlignmentRequired: BLOCKER_CLOSURE_CONTRACT.implementationPlanAlignmentRequired, // true
  selectedArchitecture: SELECTED_ARCHITECTURE, // OPTION_B_FULL_BRIDGE_DECISION_CORE
  coreEnvelopeOverallDigest: CORE.manifest.overallDigest,
});
export default CORE_ENVELOPE_CONTRACT_TRACEABILITY;
