/**
 * STUDIO BRIDGE-TO-PREVIEW SANDBOX RUNTIME CONTRACT — configuration.
 *
 * CONTRACT ONLY. This module declares the headless, deterministic, immutable, fail-closed, dev-only contract
 * between the hardened Authoring Runtime-to-Preview Bridge target descriptor and a FUTURE Preview Sandbox
 * consumer runtime. It reflects the REAL upstream shapes read-only (no invented fields, no aliases). It
 * implements NO consumer/runtime: every implementation flag is false. It mounts nothing, touches no App,
 * creates no route/menu, persists nothing, and exposes nothing to the product.
 */
import {
  TARGET_DESCRIPTOR_TARGET_FIELDS, TARGET_SANDBOX_KIND, PREVIEW_SANDBOX_CONTRACT_VERSION,
  BRIDGE_CONTRACT_VERSION, BRIDGE_IMPLEMENTATION_PLAN_VERSION, AUTHORING_RUNTIME_VERSION,
  BLUEPRINT_CONTRACT_VERSION, BRIDGE_VERSION,
} from '../authoring-runtime-to-preview-bridge/index.js';
import { MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION, ALLOWED_PREVIEW_KINDS, PROHIBITED_EFFECTS } from '../module-preview-sandbox/index.js';

export const CONTRACT_NAME = 'studio-bridge-to-preview-sandbox-runtime-contract';
export const CONTRACT_SEMVER = '1.0.0';
export const CONTRACT_VERSION = `${CONTRACT_NAME}@${CONTRACT_SEMVER}`;
export const CONTRACT_MODE = 'headless_bridge_to_preview_sandbox_runtime_contract';

// ---- Real upstream versions (read-only, reflected — never invented). ----
export const SOURCE_BRIDGE_VERSION = BRIDGE_VERSION;
export const SOURCE_BRIDGE_CONTRACT_VERSION = BRIDGE_CONTRACT_VERSION;
export const SOURCE_BRIDGE_IMPLEMENTATION_PLAN_VERSION = BRIDGE_IMPLEMENTATION_PLAN_VERSION;
export const SOURCE_AUTHORING_RUNTIME_VERSION = AUTHORING_RUNTIME_VERSION;
export const SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION = MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION;
export const SOURCE_BLUEPRINT_CONTRACT_VERSION = BLUEPRINT_CONTRACT_VERSION;
export const SOURCE_TARGET_SANDBOX_KIND = TARGET_SANDBOX_KIND; // 'module_preview_sandbox_candidate'
export const SOURCE_TARGET_CONTRACT_VERSION = PREVIEW_SANDBOX_CONTRACT_VERSION; // == preview sandbox contract version

// ---- Real bridge target descriptor shape (success target). ----
export const REAL_BRIDGE_TARGET_DESCRIPTOR_FIELDS = Object.freeze([
  'kind', 'targetKind', 'targetContractVersion', 'synthetic', 'metadataOnly', 'immutable', 'validated',
  'previewMounted', 'routeCreated', 'menuCreated', 'productExposed', 'realDataAttached', 'moduleGenerated',
  'persistenceAllowed', 'sourceHandoffKind', 'candidateDraftId', 'candidateDraftRevision', 'candidateDraftDigest',
  'sourceRuntimeVersion', 'sourceHandoffVersion', 'sourceTargetSandboxVersion', 'syntheticPayload', 'sourceDigest',
]);
export const REQUIRED_BRIDGE_TARGET_DESCRIPTOR_FIELDS = Object.freeze([
  'kind', 'targetKind', 'targetContractVersion', 'synthetic', 'metadataOnly', 'immutable', 'validated',
  'sourceHandoffKind', 'candidateDraftId', 'candidateDraftRevision', 'candidateDraftDigest', 'sourceRuntimeVersion',
  'sourceHandoffVersion', 'sourceTargetSandboxVersion', 'syntheticPayload', 'sourceDigest',
]);
export const SECURITY_BRIDGE_TARGET_DESCRIPTOR_FIELDS = Object.freeze([
  'previewMounted', 'routeCreated', 'menuCreated', 'productExposed', 'realDataAttached', 'moduleGenerated', 'persistenceAllowed',
]);
export const VERSION_BRIDGE_TARGET_DESCRIPTOR_FIELDS = Object.freeze([
  'targetContractVersion', 'sourceRuntimeVersion', 'sourceHandoffVersion', 'sourceTargetSandboxVersion',
]);
export const DIGEST_BRIDGE_TARGET_DESCRIPTOR_FIELDS = Object.freeze(['sourceDigest', 'candidateDraftDigest']);

// The contract-declared bridge mapping target fields (12) that flow into the descriptor from the bridge.
export const BRIDGE_MAPPED_TARGET_FIELDS = Object.freeze([...TARGET_DESCRIPTOR_TARGET_FIELDS]);

// Real invariants the success target descriptor MUST satisfy (value assertions).
export const REAL_TARGET_DESCRIPTOR_INVARIANTS = Object.freeze({
  targetKind: 'module_preview_sandbox_candidate',
  metadataOnly: true, synthetic: true, immutable: true, validated: true,
  previewMounted: false, routeCreated: false, menuCreated: false, productExposed: false,
  realDataAttached: false, moduleGenerated: false, persistenceAllowed: false,
});

// ---- Real preview sandbox contract reflected fields (read-only). ----
export const REAL_PREVIEW_SANDBOX_CONTRACT_FIELDS = Object.freeze([
  'kind', 'sandboxName', 'sandboxVersion', 'engineVersion', 'plannerVersion', 'blueprintContractVersion', 'mode',
  'headless', 'previewMetadataOnly', 'moduleId', 'sourceBlueprintDigest', 'readinessDecision', 'manifest',
  'readyForPreviewSandbox', 'readiness', 'overallDigest', 'nextAllowedStage',
]);
export const ALLOWED_SANDBOX_PREVIEW_KINDS = Object.freeze([...ALLOWED_PREVIEW_KINDS]);
export const SANDBOX_PROHIBITED_EFFECTS = Object.freeze([...PROHIBITED_EFFECTS]);

// Future sandbox descriptor (metadata-only envelope the future consumer WOULD build — NOT built here).
export const FUTURE_SANDBOX_DESCRIPTOR_FIELDS = Object.freeze([
  'kind', 'sandboxDescriptorKind', 'sandboxContractVersion', 'synthetic', 'metadataOnly', 'immutable', 'validated',
  'previewMounted', 'routeCreated', 'menuCreated', 'productExposed', 'realDataAttached', 'moduleGenerated',
  'persistenceAllowed', 'candidateDraftId', 'candidateDraftRevision', 'candidateDraftDigest', 'sourceDigest',
  'sourceRuntimeVersion', 'sourceHandoffVersion', 'sourceTargetSandboxVersion', 'previewMetadata',
]);
export const REQUIRED_SANDBOX_DESCRIPTOR_FIELDS = Object.freeze([
  'kind', 'sandboxDescriptorKind', 'sandboxContractVersion', 'synthetic', 'metadataOnly', 'immutable', 'validated',
  'candidateDraftId', 'candidateDraftRevision', 'candidateDraftDigest', 'sourceDigest', 'previewMetadata',
]);
export const SECURITY_SANDBOX_DESCRIPTOR_FIELDS = Object.freeze([
  'previewMounted', 'routeCreated', 'menuCreated', 'productExposed', 'realDataAttached', 'moduleGenerated', 'persistenceAllowed',
]);
export const FUTURE_SANDBOX_DESCRIPTOR_KIND = 'preview_sandbox_metadata_descriptor';

// ---- Future consumer decision statuses / readiness states. ----
export const CONSUMER_DECISION_STATUSES = Object.freeze(['sandbox_candidate_accepted', 'sandbox_candidate_rejected']);
export const CONTRACT_READINESS_STATES = Object.freeze([
  'studio_bridge_to_preview_sandbox_runtime_contract_ready_for_enterprise_audit',
  'needs_contract_fix', 'blocked', 'invalid',
]);

// ---- Future validation pipeline stages (fixed order; NOT executed in this slice). ----
export const CONSUMER_VALIDATION_STAGES = Object.freeze([
  'source_descriptor_shape_validation', 'source_descriptor_identity_validation', 'source_descriptor_version_validation',
  'source_descriptor_digest_validation', 'source_descriptor_synthetic_boundary_validation',
  'source_descriptor_security_boundary_validation', 'mapping_contract_validation', 'sandbox_contract_version_validation',
  'sandbox_descriptor_shape_validation', 'preview_mount_boundary_validation', 'real_data_boundary_validation',
  'product_exposure_boundary_validation', 'module_generation_boundary_validation', 'certification_boundary_validation',
  'prototype_reference_validation',
]);

export const CONTRACT_ISSUE_SEVERITIES = Object.freeze(['blocker', 'error', 'warning', 'info']);
export const CONTRACT_TRANSFORM_KINDS = Object.freeze(['identity', 'assert_true', 'assert_false', 'clone_synthetic', 'envelope_metadata']);

// ---- Contract issue codes. ----
export const CONTRACT_ISSUE_CODES = Object.freeze([
  'CONTRACT_SOURCE_DESCRIPTOR_NOT_OBJECT', 'CONTRACT_SOURCE_DESCRIPTOR_WRONG_KIND', 'CONTRACT_SOURCE_DESCRIPTOR_MISSING_REQUIRED_FIELD',
  'CONTRACT_SOURCE_DESCRIPTOR_INVENTED_FIELD', 'CONTRACT_SOURCE_DESCRIPTOR_SECURITY_FLAG_FORBIDDEN',
  'CONTRACT_SOURCE_DESCRIPTOR_NOT_METADATA_ONLY', 'CONTRACT_SOURCE_DESCRIPTOR_NOT_SYNTHETIC',
  'CONTRACT_SOURCE_IDENTITY_MISSING', 'CONTRACT_SOURCE_IDENTITY_INVENTED', 'CONTRACT_SOURCE_BRIDGE_DECISION_DIGEST_MISSING',
  'CONTRACT_VERSION_MISSING', 'CONTRACT_VERSION_MISMATCH', 'CONTRACT_VERSION_UNKNOWN', 'CONTRACT_VERSION_DOWNGRADE_FORBIDDEN',
  'CONTRACT_AGGREGATED_VERSION_ALIAS_FORBIDDEN', 'CONTRACT_SILENT_VERSION_COERCION_FORBIDDEN',
  'CONTRACT_SOURCE_DIGEST_MISSING', 'CONTRACT_SOURCE_DIGEST_MISMATCH', 'CONTRACT_INVENTED_TARGET_DESCRIPTOR_DIGEST_FORBIDDEN',
  'CONTRACT_SOURCE_MUTATION_FORBIDDEN', 'CONTRACT_SOURCE_REFERENCE_RETENTION_FORBIDDEN',
  'CONTRACT_MAPPING_SOURCE_FIELD_MISSING', 'CONTRACT_MAPPING_TARGET_FIELD_INVENTED', 'CONTRACT_MAPPING_UNKNOWN_TRANSFORM',
  'CONTRACT_MAPPING_CRITICAL_DEFAULT_FORBIDDEN', 'CONTRACT_MAPPING_LOSSY_CRITICAL_FORBIDDEN', 'CONTRACT_MAPPING_DUPLICATE_FORBIDDEN',
  'CONTRACT_SANDBOX_DESCRIPTOR_MISSING_REQUIRED_FIELD', 'CONTRACT_SANDBOX_DESCRIPTOR_SECURITY_FLAG_FORBIDDEN',
  'CONTRACT_PREVIEW_MOUNT_FORBIDDEN', 'CONTRACT_REAL_DATA_FORBIDDEN', 'CONTRACT_PRODUCT_EXPOSURE_FORBIDDEN',
  'CONTRACT_MODULE_GENERATION_FORBIDDEN', 'CONTRACT_CERTIFICATION_FORBIDDEN', 'CONTRACT_PROTOTYPE_REFERENCE_FORBIDDEN',
  'CONTRACT_UNKNOWN_RESOURCE_DIMENSION', 'CONTRACT_LIMIT_EXCEEDED', 'CONTRACT_PARTIAL_SANDBOX_DESCRIPTOR_FORBIDDEN',
  'CONTRACT_EXTENSION_UNNAMESPACED_FORBIDDEN', 'CONTRACT_EXTENSION_MISSING_SCHEMA', 'CONTRACT_EXTENSION_DUPLICATE_NAMESPACE',
  'CONTRACT_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN', 'CONTRACT_EXTENSION_CAPABILITY_OVERRIDE_FORBIDDEN',
  'CONTRACT_EXTENSION_VERSION_OVERRIDE_FORBIDDEN', 'CONTRACT_EXTENSION_DIGEST_OVERRIDE_FORBIDDEN',
  'CONTRACT_PROTOTYPE_POLLUTION_KEY_FORBIDDEN', 'CONTRACT_SSOT_INVERSION_FORBIDDEN', 'CONTRACT_PERMISSION_INTEGRATION_FORBIDDEN',
  'CONTRACT_PREMATURE_RUNTIME_FORBIDDEN', 'CONTRACT_MANUAL_GATE_MISSING', 'CONTRACT_UNEXPECTED_CONTRACT_FAILURE',
  'CONTRACT_CONFIG_INVALID',
]);

// ---- Capability flags — every runtime/consumer capability is false in this contract-only slice. ----
export const CONTRACT_CAPABILITIES = Object.freeze({
  // TRUE — contract definition capabilities.
  headless: true, devOnly: true, syntheticOnly: true, inMemoryOnly: true, ephemeralOnly: true, deterministic: true,
  immutable: true, failClosed: true, sideEffectFree: true, metadataOnly: true, contractOnly: true,
  realBridgeDescriptorShapeCaptured: true, realSandboxContractShapeCaptured: true, ssotPreserved: true,
  sourceConsumedReadOnly: true, upstreamsConsumedReadOnly: true,
  // FALSE — everything a real consumer/runtime would do.
  consumerImplemented: false, candidateConsumed: false, sandboxDescriptorCreated: false, sourceValidationImplemented: false,
  mappingExecutorImplemented: false, sandboxDescriptorBuilderImplemented: false, validationPipelineExecuted: false,
  previewPayloadCreated: false, previewMounted: false, appTouched: false, routeCreated: false, menuCreated: false,
  sidebarCreated: false, persistenceImplemented: false, filesystemWritesUsed: false, backendAccessed: false,
  prismaAccessed: false, fetchUsed: false, networkUsed: false, realDataRead: false, realDataWrite: false,
  moduleGenerated: false, moduleRegistered: false, certificationPerformed: false, candidateCanonical: false,
  productExposed: false, productionAccessed: false, stagingAccessed: false, prototypeRelinked: false,
  permissionModelIntegrated: false, tenantModelIntegrated: false, serverSideAuthorizationIntegrated: false,
});

export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

export const SOURCE_CHECKPOINT = 'pr_486_post_merge_deep_enterprise_hardening_audit';
export const SOURCE_DECISION = 'POST_MERGE_REVALIDATION_PASS_AND_BRIDGE_HARDENING_ENTERPRISE_PASS';
export const CURRENT_SLICE_AUTHORIZATION = 'bridge_to_preview_sandbox_runtime_contract_only';
export const REQUIRED_FUTURE_CHECKPOINT = 'post_bridge_to_preview_sandbox_runtime_contract_enterprise_audit';

export const MAK_STUDIO_BRIDGE_TO_PREVIEW_SANDBOX_CONTRACT_FLAG = 'MAK_STUDIO_BRIDGE_TO_PREVIEW_SANDBOX_CONTRACT';
export const MAK_STUDIO_BRIDGE_TO_PREVIEW_SANDBOX_CONTRACT_VERIFY_FLAG = 'MAK_STUDIO_BRIDGE_TO_PREVIEW_SANDBOX_CONTRACT_VERIFY';

/** @returns {boolean} */
export function isProductionEnv() {
  try {
    const env = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    return env.NODE_ENV === 'production' || env.VITE_ENV === 'production';
  } catch { return true; }
}
/** @returns {boolean} */
export function isStudioBridgeToPreviewSandboxContractEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_BRIDGE_TO_PREVIEW_SANDBOX_CONTRACT_FLAG] === '1'; } catch { return false; }
}
/** @returns {boolean} */
export function isStudioBridgeToPreviewSandboxContractVerifyEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_BRIDGE_TO_PREVIEW_SANDBOX_CONTRACT_VERIFY_FLAG] === '1'; } catch { return false; }
}
