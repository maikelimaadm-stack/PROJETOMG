import { SOURCE_PLAN_TRACEABILITY } from './sourcePlanTraceability.js';
import { CORE_ENVELOPE_CONTRACT_TRACEABILITY } from './coreEnvelopeContractTraceability.js';
import { DIGEST_RECOMPUTATION_ALIGNMENT } from './digestRecomputationAlignment.js';
import { deepFreeze } from './deepFreeze.js';
/** The B-RECOMPUTE-INPUT state transition: OPEN (plan) -> CLOSED_BY_CONTRACT (v2) -> RESOLVED_AT_PLAN_LEVEL. */
export const B_RECOMPUTE_INPUT_TRANSITION = deepFreeze({
  kind: 'b-recompute-input-transition',
  blockerId: 'B-RECOMPUTE-INPUT',
  previousState: 'OPEN',
  previousReason: 'envelope_v1_only_3_of_required_preimage_fields',
  contractClosureState: CORE_ENVELOPE_CONTRACT_TRACEABILITY.bRecomputeClosureState, // CLOSED_BY_CONTRACT
  planAlignmentState: 'ALIGNED_TO_CORE_ENVELOPE_V2',
  currentState: 'RESOLVED_AT_PLAN_LEVEL',
  // Proofs (derived from real upstream traceability).
  originalPlanGap: deepFreeze({
    required: SOURCE_PLAN_TRACEABILITY.originalRequiredPreimageFieldCount, // 32
    available: SOURCE_PLAN_TRACEABILITY.originalAvailablePreimageFieldCount, // 3
    missing: SOURCE_PLAN_TRACEABILITY.originalMissingPreimageFieldCount, // 29
  }),
  coreContractGap: deepFreeze({
    required: CORE_ENVELOPE_CONTRACT_TRACEABILITY.coreFieldCount, // 32
    available: CORE_ENVELOPE_CONTRACT_TRACEABILITY.coreFieldCount, // 32
    missing: CORE_ENVELOPE_CONTRACT_TRACEABILITY.missingPreimageFieldCount, // 0
    extra: CORE_ENVELOPE_CONTRACT_TRACEABILITY.extraPreimageFieldCount, // 0
  }),
  alignmentUsesCoreV2: true,
  noLocalDuplicatedPreimageList: DIGEST_RECOMPUTATION_ALIGNMENT.noLocalDuplicatedPreimageList,
  runtimeImplementationStillFalse: true,
  bRecomputeInputResolvedByPlan: DIGEST_RECOMPUTATION_ALIGNMENT.bRecomputeInputResolvedByPlan,
});
export default B_RECOMPUTE_INPUT_TRANSITION;
