/**
 * STUDIO BRIDGE DECISION ENVELOPE IDENTITY CONTRACT — public surface.
 *
 * Headless, deterministic, immutable, fail-closed, side-effect-free, dev-only CONTRACT (definition only)
 * that binds the REAL hardened `bridgeDecisionDigest` to its matching `targetDescriptor` as an explicit
 * `{ bridgeDecisionDigest, targetDescriptor }` identity/provenance envelope — the real input a FUTURE Preview
 * Sandbox consumer would receive. Exposes only `.js`. It builds no envelope, verifies no identity at runtime,
 * consumes no decision, mounts no preview, touches no App, creates no route/menu, persists nothing, and
 * exposes nothing. Closes the B-IDENTITY blocker AT CONTRACT LEVEL (digest coverage of the descriptor proven).
 */
export {
  ENVELOPE_CONTRACT_NAME, ENVELOPE_CONTRACT_SEMVER, ENVELOPE_CONTRACT_VERSION, ENVELOPE_CONTRACT_MODE, ENVELOPE_KIND,
  SOURCE_BRIDGE_RUNTIME_VERSION, SOURCE_BRIDGE_CONTRACT_VERSION_REF, SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION_REF,
  SOURCE_TARGET_SANDBOX_CONTRACT_VERSION, SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION, SOURCE_BLUEPRINT_CONTRACT_VERSION_REF,
  REAL_BRIDGE_DECISION_FIELDS, REAL_BRIDGE_DECISION_REQUIRED_FIELDS, REAL_BRIDGE_DECISION_IDENTITY_FIELDS,
  REAL_BRIDGE_DECISION_SECURITY_FIELDS, REAL_BRIDGE_DECISION_TARGET_FIELDS, REAL_TARGET_DESCRIPTOR_FIELDS,
  DECISION_DIGEST_PREIMAGE_FIELDS, ENVELOPE_FIELDS, ENVELOPE_REQUIRED_FIELDS, ENVELOPE_SECURITY_FIELDS, ENVELOPE_INVARIANTS,
  ENVELOPE_VALIDATION_STAGES, ENVELOPE_ISSUE_SEVERITIES, ENVELOPE_TRANSFORM_KINDS, ENVELOPE_DECISION_STATUSES,
  ENVELOPE_READINESS_STATES, ENVELOPE_ISSUE_CODES, ENVELOPE_CAPABILITIES, FORBIDDEN_PROTOTYPE_PATHS,
  SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
  MAK_STUDIO_BRIDGE_DECISION_ENVELOPE_CONTRACT_FLAG, MAK_STUDIO_BRIDGE_DECISION_ENVELOPE_CONTRACT_VERIFY_FLAG,
  isProductionEnv, isStudioBridgeDecisionEnvelopeContractEnabled, isStudioBridgeDecisionEnvelopeContractVerifyEnabled,
} from './envelopeContractConfig.js';

export { deepFreeze } from './deepFreeze.js';
export { isPlainObject, isNonEmptyString, isNonNegativeInteger } from './normalizeEnvelopeInput.js';
export { createEnvelopeDigest } from './createEnvelopeDigest.js';
export { SOURCE_DECISION_CONTRACT } from './sourceDecisionContract.js';
export { ENVELOPE_SHAPE_CONTRACT } from './envelopeShapeContract.js';
export { IDENTITY_BINDING_CONTRACT } from './identityBindingContract.js';
export { DIGEST_COVERAGE_CONTRACT } from './digestCoverageContract.js';
export { PROVENANCE_CONTRACT } from './provenanceContract.js';
export { VERSION_CONTRACT } from './versionContract.js';
export { READ_ONLY_CONTRACT } from './readOnlyContract.js';
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
export { createEnvelopeReadinessDecision } from './readinessContract.js';
export { createEnvelopeDiagnostics } from './diagnosticsContract.js';
export { createEnvelopeManifest } from './manifestContract.js';
export { verifyBridgeDecisionEnvelopeIdentityContract } from './verifyBridgeDecisionEnvelopeIdentityContract.js';
export { checkBridgeDecisionEnvelopeIdentityContractCompatibility } from './checkBridgeDecisionEnvelopeIdentityContractCompatibility.js';
export { createStudioBridgeDecisionEnvelopeIdentityContract } from './createStudioBridgeDecisionEnvelopeIdentityContract.js';

export { default } from './createStudioBridgeDecisionEnvelopeIdentityContract.js';
