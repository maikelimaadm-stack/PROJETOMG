/**
 * STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE IMPLEMENTATION PLAN — public surface.
 *
 * Headless, dev-only, contract-only, metadata-only, plan-only, synthetic-only, deterministic, fail-closed
 * and read-only over its upstreams. Exposes ONLY `.js`. No `.jsx`/`.tsx`/`.css`. Consumes the Authoring
 * Runtime-to-Preview Bridge Contract read-only and plans a FUTURE headless bridge as pure metadata;
 * implements NOTHING (every phase is planned, none implemented); exposes nothing to the product. The
 * certified blueprint remains the canonical SSOT.
 */

export {
  BRIDGE_IMPLEMENTATION_PLAN_NAME,
  BRIDGE_IMPLEMENTATION_PLAN_SEMVER,
  BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  BRIDGE_IMPLEMENTATION_PLAN_MODE,
  BRIDGE_CONTRACT_VERSION,
  AUTHORING_RUNTIME_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  SOURCE_HANDOFF_KIND,
  TARGET_SANDBOX_KIND,
  BRIDGE_IMPLEMENTATION_PHASE_IDS,
  REAL_HANDOFF_FIELDS,
  FORBIDDEN_LEGACY_SOURCE_FIELDS,
  SOURCE_HANDOFF_VERSION_FIELDS,
  SOURCE_HANDOFF_DIGEST_FIELDS,
  CRITICAL_SOURCE_FIELDS,
  SOURCE_BOUNDARY_FIELDS,
  BRIDGE_FIELD_MAPPINGS,
  ALLOWED_TRANSFORM_KINDS,
  BRIDGE_VALIDATION_STAGES,
  BRIDGE_ISSUE_SEVERITIES,
  EXTENSION_PROTECTED_FIELDS,
  BRIDGE_RESOURCE_LIMIT_DIMENSIONS,
  DEFAULT_BRIDGE_RESOURCE_LIMITS,
  FORBIDDEN_PROTOTYPE_PATHS,
  BRIDGE_IMPLEMENTATION_PLAN_READINESS_STATES,
  BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PHASES_FLAG,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_VERIFY_FLAG,
  bridgePlanDigest,
  isProductionEnv,
  isStudioAuthoringRuntimeToPreviewBridgeImplementationPlanEnabled,
  isStudioAuthoringRuntimeToPreviewBridgeImplementationPhasesEnabled,
  isStudioAuthoringRuntimeToPreviewBridgeImplementationVerifyEnabled,
} from './bridgeImplementationPlanConfig.js';

export {
  BRIDGE_IMPLEMENTATION_PLAN_ERROR_CODES,
  isBridgeImplementationPlanErrorCode,
  BridgeImplementationPlanError,
  createBridgeImplementationPlanError,
  bridgeImplementationPlanError,
} from './errors.js';

export { createBridgeImplementationPlanSession } from './createBridgeImplementationPlanSession.js';
export { createBridgeImplementationPhases } from './createBridgeImplementationPhases.js';
export { createSourceValidationPlan } from './createSourceValidationPlan.js';
export { createDraftIdentityEnforcementPlan } from './createDraftIdentityEnforcementPlan.js';
export { createSourceVersionValidationPlan } from './createSourceVersionValidationPlan.js';
export { createSourceDigestValidationPlan } from './createSourceDigestValidationPlan.js';
export { createSourceBoundaryValidationPlan } from './createSourceBoundaryValidationPlan.js';
export { createFieldMappingExecutionPlan } from './createFieldMappingExecutionPlan.js';
export { createTargetDescriptorConstructionPlan } from './createTargetDescriptorConstructionPlan.js';
export { createTargetVersionValidationPlan } from './createTargetVersionValidationPlan.js';
export { createCanonicalizationValidationPlan } from './createCanonicalizationValidationPlan.js';
export { createExtensibilityEnforcementPlan } from './createExtensibilityEnforcementPlan.js';
export { createBridgeValidationPipelinePlan } from './createBridgeValidationPipelinePlan.js';
export { createReplayIdempotencyPlan } from './createReplayIdempotencyPlan.js';
export { createBridgeResourceLimitsPlan } from './createBridgeResourceLimitsPlan.js';
export { createFailureContainmentPlan } from './createFailureContainmentPlan.js';
export { createBridgeSsotProtectionPlan } from './createBridgeSsotProtectionPlan.js';
export { createBridgeCertificationBoundaryPlan } from './createBridgeCertificationBoundaryPlan.js';
export { createBridgePermissionTenancyBoundaryPlan } from './createBridgePermissionTenancyBoundaryPlan.js';
export { createBridgeSecuritySafetyPlan } from './createBridgeSecuritySafetyPlan.js';
export { createBridgePrototypeRelinkAssertionPlan } from './createBridgePrototypeRelinkAssertionPlan.js';
export { createBridgeTestHarnessPlan } from './createBridgeTestHarnessPlan.js';
export { createBridgeManualEnablementGatePlan } from './createBridgeManualEnablementGatePlan.js';
export { createBridgeRolloutRollbackPlan } from './createBridgeRolloutRollbackPlan.js';
export { createBridgeObservabilityDiagnosticsPlan } from './createBridgeObservabilityDiagnosticsPlan.js';
export { createBridgeGovernanceRegistryPlan } from './createBridgeGovernanceRegistryPlan.js';
export { createBridgeImplementationReadinessDecision } from './createBridgeImplementationReadinessDecision.js';
export { createBridgeImplementationPlanManifest } from './createBridgeImplementationPlanManifest.js';
export { verifyBridgeImplementationPlan } from './verifyBridgeImplementationPlan.js';
export { checkBridgeImplementationPlanCompatibility } from './checkBridgeImplementationPlanCompatibility.js';
export { createBridgeImplementationPlanDiagnostics } from './createBridgeImplementationPlanDiagnostics.js';
export { createBridgeImplementationPlanFallback } from './createBridgeImplementationPlanFallback.js';
export { createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan } from './createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan.js';

export { default } from './createStudioAuthoringRuntimeToPreviewBridgeImplementationPlan.js';
