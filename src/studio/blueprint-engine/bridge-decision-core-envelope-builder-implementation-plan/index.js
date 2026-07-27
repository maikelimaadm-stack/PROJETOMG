/**
 * STUDIO BRIDGE DECISION CORE ENVELOPE BUILDER IMPLEMENTATION PLAN — public surface.
 *
 * Headless, deterministic, immutable, fail-closed, side-effect-free, dev-only PLAN (definition only) for the FUTURE
 * Bridge Decision Core Envelope Builder. Consumes the audited Builder Contract READ-ONLY (B-CORE-ENVELOPE-BUILDER
 * closed-by-contract; identityVerified consumer-owned; ARCHITECTURE 1 final; no Core Envelope Verification State
 * Amendment). Implements NO builder/factory/build/extractor/digest/consumer runtime, constructs no envelope, creates
 * no future subtree, mounts no preview, touches no App, persists nothing, exposes nothing. planOnly:true. Exposes .js.
 */
export {
  PLAN_NAME, PLAN_SEMVER, PLAN_VERSION, PLAN_KIND, PLAN_MODE, SELECTED_ARCHITECTURE, IDENTITY_VERIFIED_SEMANTIC_OWNER,
  FUTURE_BUILDER_RUNTIME_DIR, FUTURE_BUILDER_FACTORY, FUTURE_BUILDER_DECISION_STATUSES, SOURCE_CHECKPOINT,
  SOURCE_DECISION, SOURCE_RECOMMENDATION, CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
  PLAN_READINESS_STATES, FUTURE_IMPLEMENTATION_MIN_TEST_SCENARIOS, FUTURE_IMPLEMENTATION_MIN_GATE_CHECKS,
  PLAN_CAPABILITIES, MAK_STUDIO_CORE_ENVELOPE_BUILDER_PLAN_FLAG, isProductionEnv, isStudioCoreEnvelopeBuilderPlanEnabled,
} from './planConfig.js';

export { deepFreeze } from './deepFreeze.js';
export { isPlainObject, isNonEmptyString } from './planInput.js';
export { createPlanDigest } from './createPlanDigest.js';
export { SOURCE_TRACEABILITY } from './sourceTraceability.js';
export { FUTURE_RUNTIME_SUBTREE, FUTURE_RUNTIME_FILE_MAP } from './futureRuntimeSubtree.js';
export { FUTURE_PUBLIC_API_PLAN } from './futurePublicApiPlan.js';
export { IDENTITY_LIFECYCLE_PLAN } from './identityLifecyclePlan.js';
export { IMPLEMENTATION_PHASES, IMPLEMENTATION_PHASE_IDS } from './implementationPhases.js';
export { SAFE_NORMALIZATION_PLAN } from './safeNormalizationPlan.js';
export { SOURCE_ELIGIBILITY_PLAN } from './sourceEligibilityPlan.js';
export { CORE_EXTRACTION_PLAN } from './coreExtractionPlan.js';
export { DIGEST_RECOMPUTE_PLAN, SAME_DECISION_ATOMICITY_PLAN } from './digestAtomicityPlan.js';
export { OUTPUT_ENVELOPE_PLAN } from './outputEnvelopePlan.js';
export { BUILDER_DECISION_PLAN } from './builderDecisionPlan.js';
export { PIPELINE_EXECUTION_PLAN, ISSUE_FAILURE_PLAN, RESOURCE_LIMITS_PLAN, EXTENSIONS_REPLAY_PLAN } from './pipelineFailureLimitsPlan.js';
export { PLAN_TEST_STRATEGY, PLAN_GATE_STRATEGY } from './testGateStrategy.js';
export { RISK_MATRIX } from './riskMatrix.js';
export { QUALITY_CERTIFICATION_NOTES } from './qualityCertificationNotes.js';
export { MANUAL_CHECKPOINTS, MANUAL_ENABLEMENT_GATE } from './manualCheckpoints.js';
export { createPlanReadinessDecision } from './planReadinessDecision.js';
export { createPlanManifest } from './planManifest.js';
export { verifyBuilderImplementationPlan } from './verifyBuilderImplementationPlan.js';
export { checkBuilderImplementationPlanCompatibility } from './checkBuilderImplementationPlanCompatibility.js';
export { createPlanDiagnostics } from './planDiagnostics.js';
export { createStudioBridgeDecisionCoreEnvelopeBuilderImplementationPlan } from './createStudioBridgeDecisionCoreEnvelopeBuilderImplementationPlan.js';

export { default } from './createStudioBridgeDecisionCoreEnvelopeBuilderImplementationPlan.js';
