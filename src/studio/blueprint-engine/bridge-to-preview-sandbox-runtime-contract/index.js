/**
 * STUDIO BRIDGE-TO-PREVIEW SANDBOX RUNTIME CONTRACT — public surface.
 *
 * Headless, deterministic, immutable, fail-closed, side-effect-free, dev-only CONTRACT (definition only)
 * between the hardened Authoring Runtime-to-Preview Bridge target descriptor and a FUTURE Preview Sandbox
 * consumer runtime. Exposes only `.js`. No `.jsx`/`.tsx`/`.css`. It builds no consumer runtime, consumes no
 * candidate, creates no sandbox descriptor, mounts no preview, touches no App, creates no route/menu,
 * persists nothing, and exposes nothing to the product. The certified blueprint remains the canonical SSOT.
 */
export {
  CONTRACT_NAME, CONTRACT_SEMVER, CONTRACT_VERSION, CONTRACT_MODE,
  SOURCE_BRIDGE_VERSION, SOURCE_BRIDGE_CONTRACT_VERSION, SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  SOURCE_AUTHORING_RUNTIME_VERSION, SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION, SOURCE_BLUEPRINT_CONTRACT_VERSION,
  SOURCE_TARGET_SANDBOX_KIND, SOURCE_TARGET_CONTRACT_VERSION,
  REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS, REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS,
  SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS, VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS,
  DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS, BRIDGE_MAPPED_TARGET_FIELDS, REAL_TARGET_DESCRIPTOR_INVARIANTS,
  REAL_PREVIEW_SANDBOX_CONTRACT_FIELDS, ALLOWED_SANDBOX_PREVIEW_KINDS, SANDBOX_PROHIBITED_EFFECTS,
  FUTURE_SANDBOX_DESCRIPTOR_FIELDS, REQUIRED_SANDBOX_DESCRIPTOR_FIELDS, SECURITY_SANDBOX_DESCRIPTOR_FIELDS,
  FUTURE_SANDBOX_DESCRIPTOR_KIND, CONSUMER_DECISION_STATUSES, CONTRACT_READINESS_STATES,
  CONSUMER_VALIDATION_STAGES, CONTRACT_ISSUE_SEVERITIES, CONTRACT_TRANSFORM_KINDS, CONTRACT_ISSUE_CODES,
  CONTRACT_CAPABILITIES, FORBIDDEN_PROTOTYPE_PATHS, SOURCE_CHECKPOINT, SOURCE_DECISION,
  CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
  MAK_STUDIO_BRIDGE_TO_PREVIEW_SANDBOX_CONTRACT_FLAG, MAK_STUDIO_BRIDGE_TO_PREVIEW_SANDBOX_CONTRACT_VERIFY_FLAG,
  isProductionEnv, isStudioBridgeToPreviewSandboxContractEnabled, isStudioBridgeToPreviewSandboxContractVerifyEnabled,
} from './contractRuntimeConfig.js';

export { deepFreeze } from './deepFreeze.js';
export { isPlainObject, isNonEmptyString, isNonNegativeInteger } from './normalizeContractInput.js';
export { createContractDigest } from './createContractDigest.js';
export { SOURCE_DESCRIPTOR_CONTRACT } from './sourceDescriptorContract.js';
export { SANDBOX_DESCRIPTOR_CONTRACT } from './sandboxDescriptorContract.js';
export { IDENTITY_CONTRACT } from './identityContract.js';
export { VERSION_CONTRACT } from './versionContract.js';
export { DIGEST_CONTRACT } from './digestContract.js';
export { READ_ONLY_POLICY_CONTRACT } from './readOnlyPolicyContract.js';
export { FIELD_MAPPING_CONTRACT } from './fieldMappingContract.js';
export { VALIDATION_PIPELINE_CONTRACT } from './validationPipelineContract.js';
export { ISSUE_MODEL_CONTRACT } from './issueModelContract.js';
export { FAILURE_CONTAINMENT_CONTRACT } from './failureContainmentContract.js';
export { RESOURCE_LIMIT_CONTRACT } from './resourceLimitContract.js';
export { EXTENSIBILITY_CONTRACT } from './extensibilityContract.js';
export { REPLAY_CONTRACT } from './replayContract.js';
export { SSOT_BOUNDARY_CONTRACT } from './ssotBoundaryContract.js';
export { PERMISSION_TENANCY_BOUNDARY_CONTRACT } from './permissionTenancyBoundaryContract.js';
export { SECURITY_CONTRACT } from './securityContract.js';
export { PROTOTYPE_PROHIBITION_CONTRACT } from './prototypeProhibitionContract.js';
export { MANUAL_CHECKPOINT_CONTRACT } from './manualCheckpointContract.js';
export { createContractReadinessDecision } from './readinessContract.js';
export { createContractDiagnostics } from './diagnosticsContract.js';
export { createContractManifest } from './manifestContract.js';
export { verifyBridgeToPreviewSandboxRuntimeContract } from './verifyBridgeToPreviewSandboxRuntimeContract.js';
export { checkBridgeToPreviewSandboxRuntimeContractCompatibility } from './checkBridgeToPreviewSandboxRuntimeContractCompatibility.js';
export { createStudioBridgeToPreviewSandboxRuntimeContract } from './createStudioBridgeToPreviewSandboxRuntimeContract.js';

export { default } from './createStudioBridgeToPreviewSandboxRuntimeContract.js';
