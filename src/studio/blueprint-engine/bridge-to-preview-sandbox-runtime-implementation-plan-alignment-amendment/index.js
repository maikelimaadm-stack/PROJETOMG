/**
 * STUDIO BRIDGE-TO-PREVIEW SANDBOX RUNTIME IMPLEMENTATION PLAN ALIGNMENT AMENDMENT — public surface.
 *
 * Headless, deterministic, immutable, fail-closed, side-effect-free, dev-only AMENDMENT (definition only) that
 * aligns the merged Implementation Plan (#489) to the audited Core Envelope v2 contract (#490): supersedes the
 * former Option A recompute-input assumption, selects OPTION_B_FULL_BRIDGE_DECISION_CORE, resolves B-RECOMPUTE-
 * INPUT at plan level, declares the new pre-runtime blocker B-CORE-ENVELOPE-BUILDER, and keeps runtime blocked
 * pending CHECKPOINT_02. It modifies NO upstream plan/contract file and implements NO runtime/builder/verifier —
 * every implementation flag is false. Exposes only `.js`.
 */
export {
  AMENDMENT_NAME, AMENDMENT_SEMVER, AMENDMENT_VERSION, AMENDMENT_MODE, AMENDMENT_KIND,
  SOURCE_PLAN_VERSION, SOURCE_CORE_ENVELOPE_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_KIND, SOURCE_CORE_ENVELOPE_VERSION_TAG,
  SOURCE_CORE_FIELD_COUNT, SUPERSEDED_ARCHITECTURE, REPLACEMENT_ARCHITECTURE, SUPERSEDED_SOURCE_ENVELOPE_KIND,
  REPLACEMENT_SOURCE_ENVELOPE_KIND, AMENDMENT_READINESS_STATES, AMENDMENT_CAPABILITIES, SOURCE_CHECKPOINT,
  SOURCE_DECISION, SOURCE_RECOMMENDATION, SELECTED_ARCHITECTURE, CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
  MAK_STUDIO_PLAN_ALIGNMENT_AMENDMENT_FLAG, MAK_STUDIO_PLAN_ALIGNMENT_AMENDMENT_VERIFY_FLAG,
  isProductionEnv, isStudioPlanAlignmentAmendmentEnabled, isStudioPlanAlignmentAmendmentVerifyEnabled,
} from './amendmentConfig.js';

export { deepFreeze } from './deepFreeze.js';
export { isPlainObject, isNonEmptyString } from './amendmentInput.js';
export { createAmendmentDigest } from './createAmendmentDigest.js';
export { SOURCE_PLAN_TRACEABILITY } from './sourcePlanTraceability.js';
export { CORE_ENVELOPE_CONTRACT_TRACEABILITY } from './coreEnvelopeContractTraceability.js';
export { SUPERSESSION_CONTRACT } from './supersessionContract.js';
export { SOURCE_ENVELOPE_ALIGNMENT } from './sourceEnvelopeAlignment.js';
export { DIGEST_RECOMPUTATION_ALIGNMENT } from './digestRecomputationAlignment.js';
export { B_RECOMPUTE_INPUT_TRANSITION } from './bRecomputeInputTransition.js';
export { PHASE_ALIGNMENT } from './phaseAlignment.js';
export { FUTURE_FILE_MAP_ALIGNMENT } from './futureFileMapAlignment.js';
export { FUTURE_PUBLIC_API_ALIGNMENT } from './futurePublicApiAlignment.js';
export { PIPELINE_ALIGNMENT, PREFLIGHT_STAGES } from './pipelineAlignment.js';
export { MAPPING_ALIGNMENT } from './mappingAlignment.js';
export { FAILURE_CONTAINMENT_ALIGNMENT } from './failureContainmentAlignment.js';
export { RESOURCE_LIMITS_ALIGNMENT } from './resourceLimitsAlignment.js';
export { TEST_STRATEGY_ALIGNMENT } from './testStrategyAlignment.js';
export { GATE_STRATEGY_ALIGNMENT } from './gateStrategyAlignment.js';
export { RISK_MATRIX_ALIGNMENT, RISK_IDS } from './riskMatrixAlignment.js';
export { CORE_ENVELOPE_BUILDER_REQUIREMENT } from './coreEnvelopeBuilderRequirement.js';
export { MANUAL_CHECKPOINT_ALIGNMENT } from './manualCheckpointAlignment.js';
export { createAmendmentReadinessDecision } from './amendmentReadinessDecision.js';
export { createAmendmentManifest } from './amendmentManifest.js';
export { createAmendmentDiagnostics } from './amendmentDiagnostics.js';
export { verifyImplementationPlanAlignmentAmendment } from './verifyImplementationPlanAlignmentAmendment.js';
export { checkImplementationPlanAlignmentCompatibility } from './checkImplementationPlanAlignmentCompatibility.js';
export { createStudioImplementationPlanAlignmentAmendment } from './createStudioImplementationPlanAlignmentAmendment.js';

export { default } from './createStudioImplementationPlanAlignmentAmendment.js';
