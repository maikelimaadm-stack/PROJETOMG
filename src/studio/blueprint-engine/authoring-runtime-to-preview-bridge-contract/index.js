/**
 * STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE CONTRACT — public surface.
 *
 * Headless, dev-only, contract-only, metadata-only, synthetic-only, deterministic, fail-closed and
 * read-only over its upstreams. Exposes ONLY `.js`. No `.jsx`/`.tsx`/`.css`. Consumes the Authoring
 * Runtime's `synthetic_preview_candidate` handoff and the Module Preview Sandbox contract read-only;
 * defines the bridge contract as pure metadata; implements NO bridge, adapter, source validation,
 * target payload or preview mount; exposes nothing to the product. The certified blueprint remains the
 * canonical SSOT; drafts and candidates are non-canonical and can never self-certify.
 */

export {
  BRIDGE_CONTRACT_NAME,
  BRIDGE_CONTRACT_SEMVER,
  BRIDGE_CONTRACT_VERSION,
  BRIDGE_CONTRACT_MODE,
  AUTHORING_RUNTIME_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  PREVIEW_SANDBOX_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION,
  REQUIRED_FUTURE_CHECKPOINT,
  SOURCE_HANDOFF_KIND,
  TARGET_SANDBOX_KIND,
  REAL_HANDOFF_FIELDS,
  FORBIDDEN_LEGACY_SOURCE_FIELDS,
  SOURCE_HANDOFF_REQUIRED_FIELDS,
  SOURCE_HANDOFF_SECURITY_FIELDS,
  SOURCE_HANDOFF_VERSION_FIELDS,
  SOURCE_HANDOFF_DIGEST_FIELDS,
  CRITICAL_SOURCE_FIELDS,
  BRIDGE_FIELD_MAPPINGS,
  ALLOWED_TRANSFORM_KINDS,
  BRIDGE_VALIDATION_STAGES,
  BRIDGE_ISSUE_SEVERITIES,
  EXTENSION_PROTECTED_FIELDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  BRIDGE_CONTRACT_READINESS_STATES,
  BRIDGE_CONTRACT_CAPABILITIES,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT_FLAG,
  MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG,
  bridgeDigest,
  isProductionEnv,
  isStudioAuthoringRuntimeToPreviewBridgeContractEnabled,
  isStudioAuthoringRuntimeToPreviewBridgeVerifyEnabled,
} from './bridgeContractConfig.js';

export {
  BRIDGE_CONTRACT_ERROR_CODES,
  BridgeContractError,
  createBridgeContractError,
  bridgeContractError,
} from './errors.js';

export { createBridgeContractSession } from './createBridgeContractSession.js';
export { createSourceHandoffContract } from './createSourceHandoffContract.js';
export { createTargetPreviewSandboxContract } from './createTargetPreviewSandboxContract.js';
export { createBridgeFieldMappingContract } from './createBridgeFieldMappingContract.js';
export { createBridgeVersionCompatibilityContract } from './createBridgeVersionCompatibilityContract.js';
export { createBridgeDigestSemanticsContract } from './createBridgeDigestSemanticsContract.js';
export { createBridgeCanonicalizationContract } from './createBridgeCanonicalizationContract.js';
export { createBridgeValidationIssueContract } from './createBridgeValidationIssueContract.js';
export { createBridgeValidationPipelineContract } from './createBridgeValidationPipelineContract.js';
export { createBridgeExtensibilityPolicyContract } from './createBridgeExtensibilityPolicyContract.js';
export { createBridgeReplayIdempotencyContract } from './createBridgeReplayIdempotencyContract.js';
export { createBridgeSsotBoundaryContract } from './createBridgeSsotBoundaryContract.js';
export { createBridgeCertificationBoundaryContract } from './createBridgeCertificationBoundaryContract.js';
export { createBridgePermissionTenancyBoundaryContract } from './createBridgePermissionTenancyBoundaryContract.js';
export { createBridgeSecuritySafetyContract } from './createBridgeSecuritySafetyContract.js';
export { createBridgePrototypeRelinkProhibitionContract } from './createBridgePrototypeRelinkProhibitionContract.js';
export { createBridgeUpstreamHardeningNotes } from './createBridgeUpstreamHardeningNotes.js';
export { createBridgeManualEnablementGateContract } from './createBridgeManualEnablementGateContract.js';
export { checkBridgeCompatibility } from './checkBridgeCompatibility.js';
export { createBridgeReadinessDecision } from './createBridgeReadinessDecision.js';
export { createBridgeManifest } from './createBridgeManifest.js';
export { verifyBridgeContract } from './verifyBridgeContract.js';
export { createBridgeDiagnostics } from './createBridgeDiagnostics.js';
export { createBridgeFallback } from './createBridgeFallback.js';
export { createStudioAuthoringRuntimeToPreviewBridgeContract } from './createStudioAuthoringRuntimeToPreviewBridgeContract.js';

export { default } from './createStudioAuthoringRuntimeToPreviewBridgeContract.js';
