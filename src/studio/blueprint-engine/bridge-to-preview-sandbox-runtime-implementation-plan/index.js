/**
 * STUDIO BRIDGE-TO-PREVIEW SANDBOX RUNTIME IMPLEMENTATION PLAN — public surface.
 *
 * Headless, deterministic, immutable, fail-closed, side-effect-free, dev-only PLAN (definition only) for the
 * FUTURE Preview Sandbox consumer runtime that will receive the real `{ bridgeDecisionDigest, targetDescriptor }`
 * identity envelope. It reflects the REAL merged upstream contract shapes READ-ONLY and builds NOTHING
 * executable: no consumer runtime, no `execute`, no envelope builder, no identity verifier, no pipeline, no
 * mapping executor, no sandbox descriptor builder, no consumer decision. No preview mount, App wiring, route,
 * menu, persistence, backend/Prisma, real data, module generation, certification or product exposure. B-IDENTITY
 * is closed by contract; B-RECOMPUTE-INPUT is an OPEN plan blocker (Option A selected), so runtime implementation
 * is NOT authorized. Exposes only `.js`.
 */
export {
  PLAN_NAME, PLAN_SEMVER, PLAN_VERSION, PLAN_MODE, PLAN_KIND, FUTURE_RUNTIME_SUBTREE, FUTURE_RUNTIME_FACTORY,
  SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION, SOURCE_BRIDGE_TO_SANDBOX_RUNTIME_CONTRACT_VERSION,
  SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION_REF, SOURCE_BRIDGE_RUNTIME_VERSION_REF,
  SOURCE_BRIDGE_CONTRACT_VERSION_REF2, SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF, SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2,
  REAL_DECISION_FIELDS, REAL_DECISION_REQUIRED_FIELDS, REAL_DECISION_DIGEST_PREIMAGE_FIELDS,
  REAL_TARGET_DESCRIPTOR_FIELDS_REF, REAL_ENVELOPE_FIELDS, REAL_ENVELOPE_REQUIRED_FIELDS, REAL_ENVELOPE_INVARIANTS,
  REAL_ENVELOPE_VALIDATION_STAGES, REAL_FIELD_MAPPING_CONTRACT, REAL_MAPPING_COUNT, REAL_RESOURCE_LIMIT_CONTRACT,
  CONSUMER_DECISION_STATUSES, TRANSFORM_KINDS, PLAN_READINESS_STATES, PLAN_CAPABILITIES,
  SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
  MAK_STUDIO_BRIDGE_SANDBOX_RUNTIME_PLAN_FLAG, MAK_STUDIO_BRIDGE_SANDBOX_RUNTIME_PLAN_VERIFY_FLAG,
  isProductionEnv, isStudioBridgeSandboxRuntimePlanEnabled, isStudioBridgeSandboxRuntimePlanVerifyEnabled,
} from './planConfig.js';

export { deepFreeze } from './deepFreeze.js';
export { isPlainObject, isNonEmptyString, isNonNegativeInteger } from './planInput.js';
export { createPlanDigest } from './createPlanDigest.js';
export { PHASE_DEFINITIONS, PHASE_IDS, PHASE_COUNT } from './phaseDefinitions.js';
export { FUTURE_FILE_MAP, FUTURE_FILE_COUNT, FUTURE_FILE_NAMES } from './futureFileMap.js';
export { FUTURE_PUBLIC_API_PLAN } from './futurePublicApiPlan.js';
export { SOURCE_ENVELOPE_PLAN } from './sourceEnvelopePlan.js';
export { IDENTITY_VERIFICATION_PLAN, B_RECOMPUTE_INPUT } from './identityVerificationPlan.js';
export { DIGEST_RECOMPUTATION_INPUT_PLAN, ENVELOPE_TO_DECISION_PREIMAGE_MAP } from './digestRecomputationInputPlan.js';
export { SAME_DECISION_PROVENANCE_PLAN } from './sameDecisionProvenancePlan.js';
export { SAFE_NORMALIZATION_PLAN, MAX_ENVELOPE_STRUCTURE_DEPTH } from './safeNormalizationPlan.js';
export { VALIDATION_PIPELINE_PLAN } from './validationPipelinePlan.js';
export { MAPPING_EXECUTION_PLAN } from './mappingExecutionPlan.js';
export { SANDBOX_DESCRIPTOR_BUILD_PLAN } from './sandboxDescriptorBuildPlan.js';
export { CONSUMER_DECISION_PLAN } from './consumerDecisionPlan.js';
export { FAILURE_CONTAINMENT_PLAN } from './failureContainmentPlan.js';
export { RESOURCE_LIMITS_PLAN, RESOURCE_DIMENSION_NAMES } from './resourceLimitsPlan.js';
export { EXTENSIBILITY_PLAN } from './extensibilityPlan.js';
export { REPLAY_IDEMPOTENCY_PLAN } from './replayIdempotencyPlan.js';
export { SECURITY_SSOT_PERMISSION_PLAN } from './securitySsotPermissionPlan.js';
export { TEST_STRATEGY_PLAN } from './testStrategyPlan.js';
export { GATE_STRATEGY_PLAN } from './gateStrategyPlan.js';
export { MANUAL_CHECKPOINT_PLAN } from './manualCheckpointPlan.js';
export { RISK_MATRIX, RISK_IDS } from './riskMatrix.js';
export { createPlanManifest } from './planManifest.js';
export { createPlanReadinessDecision } from './planReadinessDecision.js';
export { createPlanDiagnostics } from './planDiagnostics.js';
export { verifyBridgeToPreviewSandboxRuntimeImplementationPlan } from './verifyBridgeToPreviewSandboxRuntimeImplementationPlan.js';
export { checkBridgeToPreviewSandboxRuntimeImplementationPlanCompatibility } from './checkBridgeToPreviewSandboxRuntimeImplementationPlanCompatibility.js';
export { createStudioBridgeToPreviewSandboxRuntimeImplementationPlan } from './createStudioBridgeToPreviewSandboxRuntimeImplementationPlan.js';

export { default } from './createStudioBridgeToPreviewSandboxRuntimeImplementationPlan.js';
