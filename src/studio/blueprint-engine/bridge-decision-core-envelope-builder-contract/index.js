/**
 * STUDIO BRIDGE DECISION CORE ENVELOPE BUILDER CONTRACT — public surface.
 *
 * Headless, deterministic, immutable, fail-closed, side-effect-free, dev-only CONTRACT (definition only) for a
 * FUTURE builder that receives a real hardened `bridgeDecision`, checks success eligibility, extracts the exact
 * digest preimage as `bridgeDecisionCore` by real allowlist, recomputes and confirms `bridgeDecisionDigest`, and
 * emits a Core Envelope v2 atomically. Reflects real merged upstream shapes/versions/arrays READ-ONLY. Builds no
 * envelope, extracts no core at runtime, verifies no identity at runtime, mounts no preview, touches no App, keeps
 * every upstream intact, and keeps runtime blocked. Declares the pre-implementation blocker B-CORE-ENVELOPE-BUILDER
 * and the OPEN blocker B-CORE-ENVELOPE-VERIFICATION-STATE (the v2 `identityVerified` invariant conflict). Exposes
 * only `.js`.
 */
export {
  BUILDER_CONTRACT_NAME, BUILDER_CONTRACT_SEMVER, BUILDER_CONTRACT_VERSION, BUILDER_CONTRACT_MODE, BUILDER_KIND,
  FUTURE_BUILDER_FACTORY, SOURCE_CORE_ENVELOPE_CONTRACT_VERSION, SOURCE_ENVELOPE_V1_CONTRACT_VERSION,
  SOURCE_PLAN_ALIGNMENT_AMENDMENT_VERSION, SOURCE_BRIDGE_RUNTIME_VERSION, SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  SOURCE_BLUEPRINT_CONTRACT_VERSION, REAL_SOURCE_BRIDGE_DECISION_FIELDS, REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS,
  SOURCE_IDENTITY_FIELDS, SOURCE_SECURITY_FIELDS, SOURCE_TARGET_FIELDS, SOURCE_VERSION_FIELDS,
  SOURCE_SUCCESS_ELIGIBILITY_FIELDS, SOURCE_DECISION_KIND, SOURCE_DECISION_SUCCESS_STATUS, SOURCE_DIGEST_FIELD,
  DIGEST_PREIMAGE_ALLOWLIST, REQUIRED_CORE_FIELDS_REF, CORE_FIELD_COUNT_REF, OUTPUT_CORE_ENVELOPE_FIELDS,
  OUTPUT_CORE_ENVELOPE_INVARIANTS, OUTPUT_CORE_ENVELOPE_KIND, OUTPUT_CORE_ENVELOPE_VERSION_TAG,
  OUTPUT_TARGET_DESCRIPTOR_FIELDS, BUILDER_DECISION_STATUSES, BUILDER_ISSUE_SEVERITIES, BUILDER_READINESS_STATES,
  BUILDER_MAX_STRUCTURE_DEPTH, BUILDER_ISSUE_CODES, BUILDER_CAPABILITIES, FORBIDDEN_PROTOTYPE_PATHS,
  FORBIDDEN_PROTOTYPE_KEYS, SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, SELECTED_ARCHITECTURE,
  CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT, MAK_STUDIO_CORE_ENVELOPE_BUILDER_CONTRACT_FLAG,
  MAK_STUDIO_CORE_ENVELOPE_BUILDER_CONTRACT_VERIFY_FLAG, isProductionEnv,
  isStudioCoreEnvelopeBuilderContractEnabled, isStudioCoreEnvelopeBuilderContractVerifyEnabled,
} from './contractConfig.js';

export { deepFreeze } from './deepFreeze.js';
export { isPlainObject, isNonEmptyString } from './builderInput.js';
export { createBuilderContractDigest } from './createBuilderContractDigest.js';
export { REAL_SOURCE_BRIDGE_DECISION_SHAPE } from './realSourceBridgeDecisionShape.js';
export { SOURCE_ELIGIBILITY_CONTRACT } from './sourceEligibilityContract.js';
export { CORE_EXTRACTION_CONTRACT } from './coreExtractionContract.js';
export { DIGEST_RECOMPUTE_CONTRACT } from './digestRecomputeContract.js';
export { SAME_DECISION_ATOMICITY_CONTRACT } from './sameDecisionAtomicityContract.js';
export { FUTURE_BUILDER_PUBLIC_API_CONTRACT } from './futureBuilderPublicApiContract.js';
export { OUTPUT_ENVELOPE_CONTRACT } from './outputEnvelopeContract.js';
export { IDENTITY_VERIFICATION_STATE_CONTRACT } from './identityVerificationStateContract.js';
export { SAFE_NORMALIZATION_CONTRACT } from './safeNormalizationContract.js';
export { VALIDATION_PIPELINE_CONTRACT, BUILDER_PIPELINE_STAGES } from './validationPipelineContract.js';
export { ISSUE_MODEL_CONTRACT } from './issueModelContract.js';
export { FAILURE_CONTAINMENT_CONTRACT } from './failureContainmentContract.js';
export { RESOURCE_LIMITS_CONTRACT, RESOURCE_DIMENSION_NAMES } from './resourceLimitsContract.js';
export { EXTENSIBILITY_CONTRACT } from './extensibilityContract.js';
export { REPLAY_IDEMPOTENCY_CONTRACT } from './replayIdempotencyContract.js';
export { SSOT_SECURITY_PERMISSION_CONTRACT } from './ssotSecurityPermissionContract.js';
export { PROTOTYPE_RELINK_PROHIBITION } from './prototypeRelinkProhibition.js';
export { BUILDER_BLOCKER_CLOSURE } from './builderBlockerClosure.js';
export { MANUAL_ENABLEMENT_GATE } from './manualEnablementGate.js';
export { createBuilderContractReadinessDecision } from './contractReadinessDecision.js';
export { createBuilderContractManifest } from './contractManifest.js';
export { createBuilderContractDiagnostics } from './contractDiagnostics.js';
export { verifyBridgeDecisionCoreEnvelopeBuilderContract } from './verifyBridgeDecisionCoreEnvelopeBuilderContract.js';
export { checkBridgeDecisionCoreEnvelopeBuilderCompatibility } from './checkBridgeDecisionCoreEnvelopeBuilderCompatibility.js';
export { createStudioBridgeDecisionCoreEnvelopeBuilderContract } from './createStudioBridgeDecisionCoreEnvelopeBuilderContract.js';

export { default } from './createStudioBridgeDecisionCoreEnvelopeBuilderContract.js';
