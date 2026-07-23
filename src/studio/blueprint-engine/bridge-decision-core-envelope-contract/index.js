/**
 * STUDIO BRIDGE DECISION CORE ENVELOPE CONTRACT (v2) — public surface.
 *
 * Headless, deterministic, immutable, fail-closed, side-effect-free, dev-only CONTRACT (definition only) for the
 * v2 identity envelope `{ bridgeDecisionDigest, bridgeDecisionCore }` that carries the COMPLETE real decision
 * digest preimage as `bridgeDecisionCore`, so a FUTURE consumer runtime can recompute-and-compare the digest
 * EXACTLY. Reflects real upstream shapes READ-ONLY (counts derived, no invented/aliased fields). Builds no
 * envelope, verifies no identity at runtime, recomputes no digest, consumes no decision, mounts no preview,
 * touches no App, creates no route/menu, persists nothing, keeps the v1 contract intact, and keeps runtime
 * blocked pending Implementation Plan alignment. Closes B-RECOMPUTE-INPUT AT CONTRACT LEVEL. Exposes only `.js`.
 */
export {
  CORE_ENVELOPE_CONTRACT_NAME, CORE_ENVELOPE_CONTRACT_SEMVER, CORE_ENVELOPE_CONTRACT_VERSION, CORE_ENVELOPE_CONTRACT_MODE,
  CORE_ENVELOPE_KIND, CORE_ENVELOPE_VERSION_TAG, V1_ENVELOPE_IDENTITY_CONTRACT_VERSION,
  SOURCE_BRIDGE_RUNTIME_VERSION_REF, SOURCE_BRIDGE_CONTRACT_VERSION_REF2, SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF,
  SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION_REF, SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2, SOURCE_IMPLEMENTATION_PLAN_VERSION_REF,
  REAL_DECISION_DIGEST_PREIMAGE_FIELDS, REAL_DECISION_FIELDS, CORE_FIELD_COUNT, DIGEST_FIELD, REQUIRED_CORE_FIELDS,
  IDENTITY_CORE_FIELDS, SECURITY_CORE_FIELDS, VERSION_CORE_FIELDS, STATUS_CORE_FIELDS, TARGET_CORE_FIELDS,
  ISSUE_CORE_FIELDS, ROLLBACK_CORE_FIELDS, DIAGNOSTIC_CORE_FIELDS, REAL_TARGET_DESCRIPTOR_FIELDS_REF,
  CORE_ENVELOPE_FIELDS, CORE_ENVELOPE_REQUIRED_FIELDS, CORE_ENVELOPE_SECURITY_FIELDS, CORE_ENVELOPE_INVARIANTS,
  CORE_ENVELOPE_VALIDATION_STAGES, CORE_ENVELOPE_ISSUE_SEVERITIES, CORE_ENVELOPE_DECISION_STATUSES,
  CORE_ENVELOPE_READINESS_STATES, CORE_ENVELOPE_ISSUE_CODES, CORE_ENVELOPE_CAPABILITIES, FORBIDDEN_PROTOTYPE_PATHS,
  SOURCE_CHECKPOINT, SOURCE_DECISION, SELECTED_ARCHITECTURE, SOURCE_RECOMMENDATION, CURRENT_SLICE_AUTHORIZATION,
  REQUIRED_FUTURE_CHECKPOINT, MAK_STUDIO_CORE_ENVELOPE_CONTRACT_FLAG, MAK_STUDIO_CORE_ENVELOPE_CONTRACT_VERIFY_FLAG,
  isProductionEnv, isStudioCoreEnvelopeContractEnabled, isStudioCoreEnvelopeContractVerifyEnabled,
} from './coreEnvelopeConfig.js';

export { deepFreeze } from './deepFreeze.js';
export { isPlainObject, isNonEmptyString, isNonNegativeInteger } from './normalizeCoreEnvelopeInput.js';
export { createCoreEnvelopeDigest } from './createCoreEnvelopeDigest.js';
export { REAL_PREIMAGE_CONTRACT } from './realPreimageContract.js';
export { BRIDGE_DECISION_CORE_CONTRACT } from './bridgeDecisionCoreContract.js';
export { CORE_ENVELOPE_V2_CONTRACT } from './coreEnvelopeV2Contract.js';
export { DIGEST_SEMANTICS_CONTRACT } from './digestSemanticsContract.js';
export { SAME_DECISION_ATOMICITY_CONTRACT } from './sameDecisionAtomicityContract.js';
export { V1_V2_COMPATIBILITY_CONTRACT } from './v1V2CompatibilityContract.js';
export { VERSION_CONTRACT } from './versionContract.js';
export { READ_ONLY_CONTRACT } from './readOnlyContract.js';
export { VALIDATION_PIPELINE_CONTRACT } from './validationPipelineContract.js';
export { ISSUE_MODEL_CONTRACT } from './issueModelContract.js';
export { FAILURE_CONTAINMENT_CONTRACT } from './failureContainmentContract.js';
export { RESOURCE_LIMIT_CONTRACT, RESOURCE_DIMENSION_NAMES } from './resourceLimitContract.js';
export { EXTENSIBILITY_CONTRACT } from './extensibilityContract.js';
export { REPLAY_CONTRACT } from './replayContract.js';
export { SSOT_BOUNDARY_CONTRACT } from './ssotBoundaryContract.js';
export { PERMISSION_TENANCY_BOUNDARY_CONTRACT } from './permissionTenancyBoundaryContract.js';
export { SECURITY_CONTRACT } from './securityContract.js';
export { PROTOTYPE_PROHIBITION_CONTRACT } from './prototypeProhibitionContract.js';
export { BLOCKER_CLOSURE_CONTRACT } from './blockerClosureContract.js';
export { MANUAL_CHECKPOINT_CONTRACT } from './manualCheckpointContract.js';
export { createCoreEnvelopeReadinessDecision } from './readinessContract.js';
export { createCoreEnvelopeDiagnostics } from './diagnosticsContract.js';
export { createCoreEnvelopeManifest } from './manifestContract.js';
export { verifyBridgeDecisionCoreEnvelopeContract } from './verifyBridgeDecisionCoreEnvelopeContract.js';
export { checkBridgeDecisionCoreEnvelopeContractCompatibility } from './checkBridgeDecisionCoreEnvelopeContractCompatibility.js';
export { createStudioBridgeDecisionCoreEnvelopeContract } from './createStudioBridgeDecisionCoreEnvelopeContract.js';

export { default } from './createStudioBridgeDecisionCoreEnvelopeContract.js';
