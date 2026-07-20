/**
 * STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE — public surface.
 *
 * The REAL headless, dev-only, synthetic-only, in-memory, ephemeral, deterministic, immutable, fail-closed
 * and side-effect-free bridge from a real Authoring Runtime `synthetic_preview_candidate` handoff to a
 * synthetic `module_preview_sandbox_candidate` target descriptor (metadata only). Exposes ONLY `.js`. No
 * `.jsx`/`.tsx`/`.css`. Consumes the corrected Bridge Contract (mappings/versions/digest/extension policy),
 * the Bridge Implementation Plan (resource limits) and the Authoring Runtime serializer + digest helper —
 * all READ-ONLY. It mounts no preview, touches no App, creates no route/menu, persists nothing, and exposes
 * nothing to the product. The certified blueprint remains the canonical SSOT.
 */

export {
  BRIDGE_NAME,
  BRIDGE_SEMVER,
  BRIDGE_VERSION,
  BRIDGE_MODE,
  SOURCE_HANDOFF_VERSION,
  AUTHORING_RUNTIME_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  BRIDGE_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  SOURCE_HANDOFF_KIND,
  TARGET_SANDBOX_KIND,
  REAL_HANDOFF_FIELDS,
  FORBIDDEN_LEGACY_SOURCE_FIELDS,
  SOURCE_HANDOFF_REQUIRED_FIELDS,
  SOURCE_HANDOFF_SECURITY_FIELDS,
  SOURCE_HANDOFF_VERSION_FIELDS,
  SOURCE_HANDOFF_DIGEST_FIELDS,
  BRIDGE_FIELD_MAPPINGS,
  ALLOWED_TRANSFORM_KINDS,
  BRIDGE_VALIDATION_STAGES,
  BRIDGE_ISSUE_SEVERITIES,
  EXTENSION_PROTECTED_FIELDS,
  DEFAULT_BRIDGE_RESOURCE_LIMITS,
  BRIDGE_RESOURCE_LIMIT_DIMENSIONS,
  TARGET_DESCRIPTOR_TARGET_FIELDS,
  BRIDGE_DECISION_STATUSES,
  BRIDGE_ISSUE_CODES,
  BRIDGE_CAPABILITIES,
  BRIDGE_READINESS_STATES,
  DEFAULT_EXPECTED_VERSIONS,
  FORBIDDEN_PROTOTYPE_PATHS,
  SOURCE_CHECKPOINT,
  SOURCE_DECISION,
  REQUIRED_FUTURE_CHECKPOINT,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_FLAG,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG,
  isProductionEnv,
  isStudioAuthoringRuntimeToPreviewBridgeEnabled,
  isStudioAuthoringRuntimeToPreviewBridgeVerifyEnabled,
} from './bridgeRuntimeConfig.js';

export { BRIDGE_ERROR_CODES, isBridgeErrorCode, BridgeError, createBridgeError, bridgeError } from './errors.js';
export { deepFreeze } from './deepFreeze.js';
export { normalizeBridgeInput, isPlainObject, isNonEmptyString, isNonNegativeInteger } from './normalizeBridgeInput.js';
export { createBridgeIssue } from './createBridgeIssue.js';
export { sortBridgeIssues } from './sortBridgeIssues.js';
export { validateStrictDraftIdentity, STRICT_DRAFT_IDENTITY_POLICY } from './validateStrictDraftIdentity.js';
export { validateSourceHandoffShape, validateSourceSecurityFlags } from './validateSourceHandoffShape.js';
export { validateSourceVersionTuple } from './validateSourceVersionTuple.js';
export { recomputeAndValidateHandoffDigest } from './recomputeAndValidateHandoffDigest.js';
export { validateSourceSyntheticBoundary } from './validateSourceSyntheticBoundary.js';
export { validateSourceSsotBoundary } from './validateSourceSsotBoundary.js';
export { validateBridgeExtensions } from './validateBridgeExtensions.js';
export { enforceBridgeResourceLimits, resolveBridgeLimits } from './enforceBridgeResourceLimits.js';
export { executeBridgeFieldMappings } from './executeBridgeFieldMappings.js';
export { createTargetPreviewSandboxDescriptor } from './createTargetPreviewSandboxDescriptor.js';
export { validateTargetDescriptor } from './validateTargetDescriptor.js';
export { createBridgeValidationPipeline } from './createBridgeValidationPipeline.js';
export { createBridgeDecision } from './createBridgeDecision.js';
export { createBridgeDecisionDigest } from './createBridgeDecisionDigest.js';
export { createBridgeReplayContract } from './createBridgeReplayContract.js';
export { createBridgeFailureContainment } from './createBridgeFailureContainment.js';
export { createBridgeSsotBoundary } from './createBridgeSsotBoundary.js';
export { createBridgePermissionTenancyBoundary } from './createBridgePermissionTenancyBoundary.js';
export { createBridgeSecuritySafety } from './createBridgeSecuritySafety.js';
export { createBridgePrototypeRelinkProhibition } from './createBridgePrototypeRelinkProhibition.js';
export { createBridgeManualEnablementGate } from './createBridgeManualEnablementGate.js';
export { createBridgeDiagnostics } from './createBridgeDiagnostics.js';
export { createBridgeReadinessDecision } from './createBridgeReadinessDecision.js';
export { createBridgeManifest } from './createBridgeManifest.js';
export { verifyAuthoringRuntimeToPreviewBridge } from './verifyAuthoringRuntimeToPreviewBridge.js';
export { checkAuthoringRuntimeToPreviewBridgeCompatibility } from './checkAuthoringRuntimeToPreviewBridgeCompatibility.js';
export { createAuthoringRuntimeToPreviewBridgeFallback } from './createAuthoringRuntimeToPreviewBridgeFallback.js';
export { createStudioAuthoringRuntimeToPreviewBridge } from './createStudioAuthoringRuntimeToPreviewBridge.js';

export { default } from './createStudioAuthoringRuntimeToPreviewBridge.js';
