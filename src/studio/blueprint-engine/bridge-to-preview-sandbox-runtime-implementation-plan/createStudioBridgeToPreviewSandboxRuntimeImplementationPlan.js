import {
  PLAN_NAME, PLAN_VERSION, PLAN_MODE, PLAN_CAPABILITIES, FUTURE_RUNTIME_SUBTREE, CONSUMER_DECISION_STATUSES,
  SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
} from './planConfig.js';
import { PHASE_DEFINITIONS } from './phaseDefinitions.js';
import { FUTURE_FILE_MAP } from './futureFileMap.js';
import { FUTURE_PUBLIC_API_PLAN } from './futurePublicApiPlan.js';
import { SOURCE_ENVELOPE_PLAN } from './sourceEnvelopePlan.js';
import { IDENTITY_VERIFICATION_PLAN } from './identityVerificationPlan.js';
import { DIGEST_RECOMPUTATION_INPUT_PLAN } from './digestRecomputationInputPlan.js';
import { SAME_DECISION_PROVENANCE_PLAN } from './sameDecisionProvenancePlan.js';
import { SAFE_NORMALIZATION_PLAN } from './safeNormalizationPlan.js';
import { VALIDATION_PIPELINE_PLAN } from './validationPipelinePlan.js';
import { MAPPING_EXECUTION_PLAN } from './mappingExecutionPlan.js';
import { SANDBOX_DESCRIPTOR_BUILD_PLAN } from './sandboxDescriptorBuildPlan.js';
import { CONSUMER_DECISION_PLAN } from './consumerDecisionPlan.js';
import { FAILURE_CONTAINMENT_PLAN } from './failureContainmentPlan.js';
import { RESOURCE_LIMITS_PLAN } from './resourceLimitsPlan.js';
import { EXTENSIBILITY_PLAN } from './extensibilityPlan.js';
import { REPLAY_IDEMPOTENCY_PLAN } from './replayIdempotencyPlan.js';
import { SECURITY_SSOT_PERMISSION_PLAN } from './securitySsotPermissionPlan.js';
import { TEST_STRATEGY_PLAN } from './testStrategyPlan.js';
import { GATE_STRATEGY_PLAN } from './gateStrategyPlan.js';
import { MANUAL_CHECKPOINT_PLAN } from './manualCheckpointPlan.js';
import { RISK_MATRIX } from './riskMatrix.js';
import { createPlanManifest } from './planManifest.js';
import { createPlanReadinessDecision } from './planReadinessDecision.js';
import { checkBridgeToPreviewSandboxRuntimeImplementationPlanCompatibility } from './checkBridgeToPreviewSandboxRuntimeImplementationPlanCompatibility.js';
import { verifyBridgeToPreviewSandboxRuntimeImplementationPlan } from './verifyBridgeToPreviewSandboxRuntimeImplementationPlan.js';
import { createPlanDiagnostics } from './planDiagnostics.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Composes the STUDIO BRIDGE-TO-PREVIEW SANDBOX RUNTIME IMPLEMENTATION PLAN. PLAN ONLY — it builds no consumer
 * runtime, executes no pipeline, verifies no identity, maps no fields, builds no sandbox descriptor, creates no
 * consumer decision, mounts no preview and exposes no product. It composes frozen plan declarations, a
 * deterministic manifest, a fail-closed verifier and a readiness decision. B-IDENTITY is closed by contract;
 * B-RECOMPUTE-INPUT is an OPEN, explicitly-analysed plan blocker (Option A selected), so runtime implementation
 * is NOT authorized. @param {Object} [options] @returns {Object}
 */
export function createStudioBridgeToPreviewSandboxRuntimeImplementationPlan(options = {}) {
  const parts = {
    config: { name: PLAN_NAME, version: PLAN_VERSION, mode: PLAN_MODE, futureRuntimeSubtree: FUTURE_RUNTIME_SUBTREE },
    phases: PHASE_DEFINITIONS,
    futureFileMap: FUTURE_FILE_MAP,
    futurePublicApi: FUTURE_PUBLIC_API_PLAN,
    sourceEnvelopePlan: SOURCE_ENVELOPE_PLAN,
    identityVerificationPlan: IDENTITY_VERIFICATION_PLAN,
    digestRecomputationInputPlan: DIGEST_RECOMPUTATION_INPUT_PLAN,
    sameDecisionProvenancePlan: SAME_DECISION_PROVENANCE_PLAN,
    safeNormalizationPlan: SAFE_NORMALIZATION_PLAN,
    validationPipelinePlan: VALIDATION_PIPELINE_PLAN,
    mappingExecutionPlan: MAPPING_EXECUTION_PLAN,
    sandboxDescriptorBuildPlan: SANDBOX_DESCRIPTOR_BUILD_PLAN,
    consumerDecisionPlan: CONSUMER_DECISION_PLAN,
    failureContainmentPlan: FAILURE_CONTAINMENT_PLAN,
    resourceLimitsPlan: RESOURCE_LIMITS_PLAN,
    extensibilityPlan: EXTENSIBILITY_PLAN,
    replayIdempotencyPlan: REPLAY_IDEMPOTENCY_PLAN,
    securitySsotPermissionPlan: SECURITY_SSOT_PERMISSION_PLAN,
    testStrategyPlan: TEST_STRATEGY_PLAN,
    gateStrategyPlan: GATE_STRATEGY_PLAN,
    manualCheckpointPlan: MANUAL_CHECKPOINT_PLAN,
    riskMatrix: RISK_MATRIX,
  };

  const bIdentityClosedByContract = IDENTITY_VERIFICATION_PLAN.bIdentityClosedByContract === true;
  const bRecomputeInputResolvedByPlan = IDENTITY_VERIFICATION_PLAN.bRecomputeInputResolvedByPlan === true;

  const readinessDecision = createPlanReadinessDecision({
    blockers: [], planFullyDefined: true, bIdentityClosedByContract, bRecomputeInputResolvedByPlan,
  });
  const manifest = createPlanManifest({ parts });
  const compatibility = checkBridgeToPreviewSandboxRuntimeImplementationPlanCompatibility();

  const base = {
    kind: 'studio-bridge-to-preview-sandbox-runtime-implementation-plan',
    planName: PLAN_NAME,
    planVersion: PLAN_VERSION,
    mode: PLAN_MODE,
    futureRuntimeSubtree: FUTURE_RUNTIME_SUBTREE,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    sourceCheckpointDecision: SOURCE_DECISION,
    sourceRecommendation: SOURCE_RECOMMENDATION,
    currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    ...parts,
    consumerDecisionStatuses: [...CONSUMER_DECISION_STATUSES],
    capabilities: { ...PLAN_CAPABILITIES },
    compatibility,
    readinessDecision,
    readiness: readinessDecision.readiness,
    manifest,
    // ---- Plan state flags (§29). ----
    implementationPlanCreated: true,
    phasesDefined: PHASE_DEFINITIONS.length >= 18,
    futureFileMapDefined: FUTURE_FILE_MAP.length > 0,
    futureApiDefined: true,
    identityVerificationPlanDefined: true,
    sameDecisionProvenancePlanDefined: true,
    safeNormalizationPlanDefined: true,
    validationPipelinePlanDefined: true,
    mappingExecutionPlanDefined: true,
    sandboxDescriptorPlanDefined: true,
    consumerDecisionPlanDefined: true,
    failureContainmentPlanDefined: true,
    resourceLimitPlanDefined: true,
    extensionPlanDefined: true,
    replayPlanDefined: true,
    testStrategyDefined: true,
    gateStrategyDefined: true,
    riskMatrixDefined: true,
    manualCheckpointsDefined: true,
    // ---- Runtime NEVER implemented in this slice. ----
    runtimeImplemented: false,
    runtimeFactoryImplemented: false,
    executeImplemented: false,
    envelopeBuilderImplemented: false,
    identityVerificationImplemented: false,
    pipelineImplemented: false,
    mappingExecutorImplemented: false,
    sandboxDescriptorBuilderImplemented: false,
    consumerDecisionImplemented: false,
    previewMounted: false,
    appTouched: false,
    routeCreated: false,
    menuCreated: false,
    persistenceImplemented: false,
    backendAccessed: false,
    prismaAccessed: false,
    networkUsed: false,
    realDataRead: false,
    moduleGenerated: false,
    certificationPerformed: false,
    productExposed: false,
    productionAccessed: false,
    prototypeRelinked: false,
    permissionModelIntegrated: false,
    tenantModelIntegrated: false,
    // ---- Blockers / readiness gates. ----
    bIdentityClosedByContract,
    bRecomputeInputResolvedByPlan,
    readyForEnterprisePlanAudit: true,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    planOnly: true,
    metadataOnly: true,
  };

  const verification = verifyBridgeToPreviewSandboxRuntimeImplementationPlan({ plan: base });
  const diagnostics = createPlanDiagnostics({ verification });

  return Object.freeze(deepFreeze({ ...base, verification, diagnostics }));
}

export default createStudioBridgeToPreviewSandboxRuntimeImplementationPlan;
