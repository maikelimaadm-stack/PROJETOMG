/**
 * STUDIO BRIDGE DECISION ENVELOPE IDENTITY CONTRACT — configuration.
 *
 * CONTRACT ONLY. Declares the headless, deterministic, immutable, fail-closed, dev-only identity/provenance
 * envelope contract that binds the REAL hardened `bridgeDecisionDigest` to its matching `targetDescriptor`
 * as an explicit `{ bridgeDecisionDigest, targetDescriptor }` envelope — the real input the FUTURE Preview
 * Sandbox consumer would receive. It reflects the REAL upstream shapes read-only (no invented fields/aliases)
 * and implements NO envelope builder / no consumer runtime (every implementation flag is false). It closes
 * the B-IDENTITY blocker AT CONTRACT LEVEL only, proving digest coverage of the target descriptor.
 */
import {
  REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS, SOURCE_BRIDGE_VERSION, SOURCE_BRIDGE_CONTRACT_VERSION,
  SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION, SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION, SOURCE_BLUEPRINT_CONTRACT_VERSION,
  CONTRACT_VERSION as BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION,
} from '../bridge-to-preview-sandbox-runtime-contract/index.js';

export const ENVELOPE_CONTRACT_NAME = 'studio-bridge-decision-envelope-identity-contract';
export const ENVELOPE_CONTRACT_SEMVER = '1.0.0';
export const ENVELOPE_CONTRACT_VERSION = `${ENVELOPE_CONTRACT_NAME}@${ENVELOPE_CONTRACT_SEMVER}`;
export const ENVELOPE_CONTRACT_MODE = 'headless_bridge_decision_envelope_identity_contract';
export const ENVELOPE_KIND = 'bridge_decision_identity_envelope';

// ---- Real upstream versions (read-only, reflected). ----
export const SOURCE_BRIDGE_RUNTIME_VERSION = SOURCE_BRIDGE_VERSION;
export const SOURCE_BRIDGE_CONTRACT_VERSION_REF = SOURCE_BRIDGE_CONTRACT_VERSION;
export const SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION_REF = SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION;
export const SOURCE_TARGET_SANDBOX_CONTRACT_VERSION = SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION;
export const SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION = BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION;
export const SOURCE_BLUEPRINT_CONTRACT_VERSION_REF = SOURCE_BLUEPRINT_CONTRACT_VERSION;

// ---- Real bridge DECISION shape (from the hardened bridge; captured read-only, no invention). ----
export const REAL_BRIDGE_DECISION_FIELDS = Object.freeze([
  'kind', 'bridgeVersion', 'mode', 'ok', 'status', 'targetDescriptorCreated', 'targetDescriptor', 'issues',
  'issueCount', 'blockerCount', 'errorCount', 'warningCount', 'stages', 'stageCount', 'sourceMutated', 'sideEffects',
  'externalCleanupRequired', 'databaseRollbackRequired', 'filesystemCleanupRequired', 'rollbackByNonConsumption',
  'partialTargetDescriptor', 'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persisted', 'productExposed',
  'moduleGenerated', 'certificationPerformed', 'realDataRead', 'idempotent', 'replaySideEffectsAllowed', 'bridgeDecisionDigest',
]);
export const REAL_BRIDGE_DECISION_REQUIRED_FIELDS = Object.freeze([
  'kind', 'bridgeVersion', 'mode', 'ok', 'status', 'targetDescriptorCreated', 'targetDescriptor', 'issues', 'bridgeDecisionDigest',
]);
export const REAL_BRIDGE_DECISION_IDENTITY_FIELDS = Object.freeze(['bridgeDecisionDigest', 'status', 'bridgeVersion']);
export const REAL_BRIDGE_DECISION_SECURITY_FIELDS = Object.freeze([
  'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persisted', 'productExposed', 'moduleGenerated',
  'certificationPerformed', 'realDataRead', 'sourceMutated',
]);
export const REAL_BRIDGE_DECISION_TARGET_FIELDS = Object.freeze(['targetDescriptor', 'targetDescriptorCreated']);
// Real target descriptor shape reflected from the bridge-to-sandbox runtime contract (already captured read-only).
export const REAL_TARGET_DESCRIPTOR_FIELDS = Object.freeze([...REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS]);

// The digested decision core INCLUDES the full targetDescriptor (proven upstream), minus bridgeDecisionDigest.
export const DECISION_DIGEST_PREIMAGE_FIELDS = Object.freeze(
  REAL_BRIDGE_DECISION_FIELDS.filter((f) => f !== 'bridgeDecisionDigest'),
);

// ---- Envelope shape (declared; NO envelope is built in this slice). ----
export const ENVELOPE_FIELDS = Object.freeze([
  'envelopeKind', 'envelopeVersion', 'bridgeDecisionDigest', 'targetDescriptor', 'sourceBridgeDecisionStatus',
  'sourceBridgeRuntimeVersion', 'sourceBridgeContractVersion', 'sourceTargetSandboxVersion', 'synthetic', 'immutable',
  'metadataOnly', 'identityVerified', 'sourceDecisionConsumed', 'targetDescriptorConsumed', 'consumerRuntimeInvoked',
  'previewMounted', 'productExposed',
]);
export const ENVELOPE_REQUIRED_FIELDS = Object.freeze([
  'envelopeKind', 'envelopeVersion', 'bridgeDecisionDigest', 'targetDescriptor', 'sourceBridgeDecisionStatus',
  'synthetic', 'immutable', 'metadataOnly',
]);
export const ENVELOPE_SECURITY_FIELDS = Object.freeze([
  'identityVerified', 'sourceDecisionConsumed', 'targetDescriptorConsumed', 'consumerRuntimeInvoked', 'previewMounted', 'productExposed',
]);
export const ENVELOPE_INVARIANTS = Object.freeze({
  envelopeKind: 'bridge_decision_identity_envelope',
  synthetic: true, immutable: true, metadataOnly: true,
  identityVerified: false, sourceDecisionConsumed: false, targetDescriptorConsumed: false,
  consumerRuntimeInvoked: false, previewMounted: false, productExposed: false,
});

// ---- Future validation pipeline stages (fixed order; NOT executed here). ----
export const ENVELOPE_VALIDATION_STAGES = Object.freeze([
  'source_decision_shape_validation', 'source_decision_status_validation', 'source_decision_digest_validation',
  'target_descriptor_presence_validation', 'target_descriptor_shape_validation', 'decision_descriptor_pair_validation',
  'source_version_validation', 'target_version_validation', 'synthetic_boundary_validation', 'security_boundary_validation',
  'ssot_boundary_validation', 'preview_mount_boundary_validation', 'real_data_boundary_validation',
  'module_generation_boundary_validation', 'certification_boundary_validation', 'product_exposure_boundary_validation',
  'prototype_reference_validation',
]);

export const ENVELOPE_ISSUE_SEVERITIES = Object.freeze(['blocker', 'error', 'warning', 'info']);
export const ENVELOPE_TRANSFORM_KINDS = Object.freeze(['identity', 'assert_true', 'assert_false', 'reference_readonly']);
export const ENVELOPE_DECISION_STATUSES = Object.freeze(['envelope_identity_accepted', 'envelope_identity_rejected']);
export const ENVELOPE_READINESS_STATES = Object.freeze([
  'studio_bridge_decision_envelope_identity_contract_ready_for_enterprise_audit',
  'needs_contract_fix', 'blocked', 'invalid',
]);

export const ENVELOPE_ISSUE_CODES = Object.freeze([
  'ENVELOPE_SOURCE_DECISION_MISSING', 'ENVELOPE_SOURCE_DECISION_NOT_OBJECT', 'ENVELOPE_SOURCE_DECISION_WRONG_KIND',
  'ENVELOPE_SOURCE_DECISION_MISSING_REQUIRED_FIELD', 'ENVELOPE_SOURCE_DECISION_INVENTED_FIELD',
  'ENVELOPE_SOURCE_DECISION_NOT_OK', 'ENVELOPE_SOURCE_DECISION_WRONG_STATUS',
  'ENVELOPE_BRIDGE_DECISION_DIGEST_MISSING', 'ENVELOPE_BRIDGE_DECISION_DIGEST_MISMATCH',
  'ENVELOPE_BRIDGE_DECISION_DIGEST_TAMPERED', 'ENVELOPE_TARGET_DESCRIPTOR_MISSING', 'ENVELOPE_TARGET_DESCRIPTOR_NOT_OBJECT',
  'ENVELOPE_TARGET_DESCRIPTOR_WRONG_KIND', 'ENVELOPE_TARGET_DESCRIPTOR_MISSING_REQUIRED_FIELD',
  'ENVELOPE_TARGET_DESCRIPTOR_SECURITY_FLAG_FORBIDDEN', 'ENVELOPE_DECISION_DESCRIPTOR_PAIR_MISMATCH',
  'ENVELOPE_CROSS_DECISION_DESCRIPTOR_MIX_FORBIDDEN', 'ENVELOPE_DESCRIPTOR_REPLACEMENT_FORBIDDEN',
  'ENVELOPE_DIGEST_REPLACEMENT_FORBIDDEN', 'ENVELOPE_IDENTITY_SYNTHESIS_FORBIDDEN', 'ENVELOPE_IDENTITY_ALIAS_FORBIDDEN',
  'ENVELOPE_IDENTITY_FALLBACK_FORBIDDEN', 'ENVELOPE_VERSION_MISSING', 'ENVELOPE_VERSION_MISMATCH',
  'ENVELOPE_VERSION_UNKNOWN', 'ENVELOPE_VERSION_DOWNGRADE_FORBIDDEN', 'ENVELOPE_AGGREGATED_VERSION_ALIAS_FORBIDDEN',
  'ENVELOPE_SILENT_VERSION_COERCION_FORBIDDEN', 'ENVELOPE_SOURCE_MUTATION_FORBIDDEN',
  'ENVELOPE_REFERENCE_RETENTION_FORBIDDEN', 'ENVELOPE_PARTIAL_ENVELOPE_FORBIDDEN', 'ENVELOPE_PREVIEW_MOUNT_FORBIDDEN',
  'ENVELOPE_REAL_DATA_FORBIDDEN', 'ENVELOPE_PRODUCT_EXPOSURE_FORBIDDEN', 'ENVELOPE_MODULE_GENERATION_FORBIDDEN',
  'ENVELOPE_CERTIFICATION_FORBIDDEN', 'ENVELOPE_PROTOTYPE_REFERENCE_FORBIDDEN', 'ENVELOPE_UNKNOWN_RESOURCE_DIMENSION',
  'ENVELOPE_LIMIT_EXCEEDED', 'ENVELOPE_EXTENSION_UNNAMESPACED_FORBIDDEN', 'ENVELOPE_EXTENSION_MISSING_SCHEMA',
  'ENVELOPE_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN', 'ENVELOPE_EXTENSION_CAPABILITY_OVERRIDE_FORBIDDEN',
  'ENVELOPE_EXTENSION_VERSION_OVERRIDE_FORBIDDEN', 'ENVELOPE_EXTENSION_DIGEST_OVERRIDE_FORBIDDEN',
  'ENVELOPE_PROTOTYPE_POLLUTION_KEY_FORBIDDEN', 'ENVELOPE_SSOT_INVERSION_FORBIDDEN', 'ENVELOPE_PERMISSION_INTEGRATION_FORBIDDEN',
  'ENVELOPE_PREMATURE_RUNTIME_FORBIDDEN', 'ENVELOPE_MANUAL_GATE_MISSING', 'ENVELOPE_UNEXPECTED_CONTRACT_FAILURE',
  'ENVELOPE_CONFIG_INVALID',
]);

export const ENVELOPE_CAPABILITIES = Object.freeze({
  headless: true, devOnly: true, syntheticOnly: true, inMemoryOnly: true, ephemeralOnly: true, deterministic: true,
  immutable: true, failClosed: true, sideEffectFree: true, metadataOnly: true, contractOnly: true,
  realBridgeDecisionShapeCaptured: true, realTargetDescriptorShapeCaptured: true, decisionDigestCoversTargetDescriptor: true,
  ssotPreserved: true, sourceConsumedReadOnly: true, upstreamsConsumedReadOnly: true,
  envelopeBuilderImplemented: false, identityVerificationImplemented: false, validationExecuted: false,
  consumerRuntimeImplemented: false, sourceDecisionConsumed: false, targetDescriptorConsumed: false,
  previewPayloadCreated: false, previewMounted: false, appTouched: false, routeCreated: false, menuCreated: false,
  sidebarCreated: false, persistenceImplemented: false, filesystemWritesUsed: false, backendAccessed: false,
  prismaAccessed: false, fetchUsed: false, networkUsed: false, realDataRead: false, realDataWrite: false,
  moduleGenerated: false, moduleRegistered: false, certificationPerformed: false, envelopeCanonical: false,
  productExposed: false, productionAccessed: false, stagingAccessed: false, prototypeRelinked: false,
  permissionModelIntegrated: false, tenantModelIntegrated: false, serverSideAuthorizationIntegrated: false,
});

export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

export const SOURCE_CHECKPOINT = 'pr_487_post_merge_deep_enterprise_contract_audit';
export const SOURCE_DECISION = 'POST_MERGE_REVALIDATION_PASS_AND_CONTRACT_ENTERPRISE_PASS';
export const SOURCE_RECOMMENDATION = 'READY_FOR_BRIDGE_DECISION_ENVELOPE_IDENTITY_CONTRACT';
export const CURRENT_SLICE_AUTHORIZATION = 'bridge_decision_envelope_identity_contract_only';
export const REQUIRED_FUTURE_CHECKPOINT = 'post_bridge_decision_envelope_identity_contract_enterprise_audit';

export const MAK_STUDIO_BRIDGE_DECISION_ENVELOPE_CONTRACT_FLAG = 'MAK_STUDIO_BRIDGE_DECISION_ENVELOPE_CONTRACT';
export const MAK_STUDIO_BRIDGE_DECISION_ENVELOPE_CONTRACT_VERIFY_FLAG = 'MAK_STUDIO_BRIDGE_DECISION_ENVELOPE_CONTRACT_VERIFY';

/** @returns {boolean} */
export function isProductionEnv() {
  try {
    const env = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    return env.NODE_ENV === 'production' || env.VITE_ENV === 'production';
  } catch { return true; }
}
/** @returns {boolean} */
export function isStudioBridgeDecisionEnvelopeContractEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_BRIDGE_DECISION_ENVELOPE_CONTRACT_FLAG] === '1'; } catch { return false; }
}
/** @returns {boolean} */
export function isStudioBridgeDecisionEnvelopeContractVerifyEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_BRIDGE_DECISION_ENVELOPE_CONTRACT_VERIFY_FLAG] === '1'; } catch { return false; }
}
