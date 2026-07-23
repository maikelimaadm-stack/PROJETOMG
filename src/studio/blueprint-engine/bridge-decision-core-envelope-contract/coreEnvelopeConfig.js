/**
 * STUDIO BRIDGE DECISION CORE ENVELOPE CONTRACT (v2) — configuration.
 *
 * CONTRACT ONLY. Declares the headless, deterministic, immutable, fail-closed, dev-only v2 identity envelope
 * `{ bridgeDecisionDigest, bridgeDecisionCore }` where `bridgeDecisionCore` carries the COMPLETE real decision
 * digest preimage (`DECISION_DIGEST_PREIMAGE_FIELDS`), so a FUTURE consumer runtime can recompute-and-compare
 * the digest EXACTLY. It reflects the REAL upstream shapes READ-ONLY (no invented/aliased/hardcoded fields;
 * every count derived) and implements NO envelope builder / no consumer runtime (every implementation flag is
 * false). It closes B-RECOMPUTE-INPUT AT CONTRACT LEVEL while keeping the v1 contract intact and runtime blocked
 * pending Implementation Plan alignment.
 */
import {
  REAL_BRIDGE_DECISION_FIELDS, REAL_BRIDGE_DECISION_REQUIRED_FIELDS, REAL_BRIDGE_DECISION_IDENTITY_FIELDS,
  REAL_BRIDGE_DECISION_SECURITY_FIELDS, REAL_BRIDGE_DECISION_TARGET_FIELDS, DECISION_DIGEST_PREIMAGE_FIELDS,
  REAL_TARGET_DESCRIPTOR_FIELDS, ENVELOPE_CONTRACT_VERSION as V1_ENVELOPE_CONTRACT_VERSION,
  SOURCE_BRIDGE_RUNTIME_VERSION, SOURCE_BRIDGE_CONTRACT_VERSION_REF, SOURCE_TARGET_SANDBOX_CONTRACT_VERSION,
  SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION, SOURCE_BLUEPRINT_CONTRACT_VERSION_REF,
} from '../bridge-decision-envelope-identity-contract/index.js';
import { PLAN_VERSION as IMPLEMENTATION_PLAN_VERSION } from '../bridge-to-preview-sandbox-runtime-implementation-plan/index.js';
import { deepFreeze } from './deepFreeze.js';

export const CORE_ENVELOPE_CONTRACT_NAME = 'studio-bridge-decision-core-envelope-contract';
export const CORE_ENVELOPE_CONTRACT_SEMVER = '1.0.0';
export const CORE_ENVELOPE_CONTRACT_VERSION = `${CORE_ENVELOPE_CONTRACT_NAME}@${CORE_ENVELOPE_CONTRACT_SEMVER}`;
export const CORE_ENVELOPE_CONTRACT_MODE = 'headless_bridge_decision_core_envelope_contract';
export const CORE_ENVELOPE_KIND = 'bridge_decision_core_envelope';
export const CORE_ENVELOPE_VERSION_TAG = 'v2';

// ---- Real upstream versions (read-only, reflected). ----
export const V1_ENVELOPE_IDENTITY_CONTRACT_VERSION = V1_ENVELOPE_CONTRACT_VERSION;
export const SOURCE_BRIDGE_RUNTIME_VERSION_REF = SOURCE_BRIDGE_RUNTIME_VERSION;
export const SOURCE_BRIDGE_CONTRACT_VERSION_REF2 = SOURCE_BRIDGE_CONTRACT_VERSION_REF;
export const SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF = SOURCE_TARGET_SANDBOX_CONTRACT_VERSION;
export const SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION_REF = SOURCE_BRIDGE_TO_SANDBOX_CONSUMER_CONTRACT_VERSION;
export const SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2 = SOURCE_BLUEPRINT_CONTRACT_VERSION_REF;
export const SOURCE_IMPLEMENTATION_PLAN_VERSION_REF = IMPLEMENTATION_PLAN_VERSION;

// ---- Real preimage / core fields (reflected READ-ONLY; counts DERIVED, never hardcoded). ----
// The core IS exactly the real digest preimage (the 32 fields the digest covers, minus bridgeDecisionDigest).
export const REAL_DECISION_DIGEST_PREIMAGE_FIELDS = Object.freeze([...DECISION_DIGEST_PREIMAGE_FIELDS]);
export const REAL_DECISION_FIELDS = Object.freeze([...REAL_BRIDGE_DECISION_FIELDS]);
export const CORE_FIELD_COUNT = REAL_DECISION_DIGEST_PREIMAGE_FIELDS.length; // derived
export const DIGEST_FIELD = 'bridgeDecisionDigest';

// Required core fields = the WHOLE preimage (every field is required to recompute the digest).
export const REQUIRED_CORE_FIELDS = Object.freeze([...REAL_DECISION_DIGEST_PREIMAGE_FIELDS]);
// Classifications derived from the real decision arrays, intersected with the preimage (digest excluded).
const inPreimage = (f) => REAL_DECISION_DIGEST_PREIMAGE_FIELDS.includes(f);
export const IDENTITY_CORE_FIELDS = Object.freeze(REAL_BRIDGE_DECISION_IDENTITY_FIELDS.filter((f) => inPreimage(f)));
export const SECURITY_CORE_FIELDS = Object.freeze(REAL_BRIDGE_DECISION_SECURITY_FIELDS.filter((f) => inPreimage(f)));
export const VERSION_CORE_FIELDS = Object.freeze(['bridgeVersion'].filter((f) => inPreimage(f)));
export const STATUS_CORE_FIELDS = Object.freeze(['ok', 'status'].filter((f) => inPreimage(f)));
export const TARGET_CORE_FIELDS = Object.freeze(REAL_BRIDGE_DECISION_TARGET_FIELDS.filter((f) => inPreimage(f)));
export const ISSUE_CORE_FIELDS = Object.freeze(['issues', 'issueCount', 'blockerCount', 'errorCount', 'warningCount'].filter((f) => inPreimage(f)));
export const ROLLBACK_CORE_FIELDS = Object.freeze(['rollbackByNonConsumption', 'externalCleanupRequired', 'databaseRollbackRequired', 'filesystemCleanupRequired', 'partialTargetDescriptor'].filter((f) => inPreimage(f)));
export const DIAGNOSTIC_CORE_FIELDS = Object.freeze(['kind', 'mode', 'stages', 'stageCount', 'sideEffects', 'idempotent', 'replaySideEffectsAllowed'].filter((f) => inPreimage(f)));
export const REAL_TARGET_DESCRIPTOR_FIELDS_REF = Object.freeze([...REAL_TARGET_DESCRIPTOR_FIELDS]);

// ---- Envelope v2 shape (declared; NO envelope is built here). ----
export const CORE_ENVELOPE_FIELDS = Object.freeze([
  'envelopeKind', 'envelopeVersion', 'bridgeDecisionDigest', 'bridgeDecisionCore', 'synthetic', 'immutable',
  'metadataOnly', 'identityVerified', 'coreConsumed', 'consumerRuntimeInvoked', 'previewMounted', 'productExposed',
]);
export const CORE_ENVELOPE_REQUIRED_FIELDS = Object.freeze([
  'envelopeKind', 'envelopeVersion', 'bridgeDecisionDigest', 'bridgeDecisionCore', 'synthetic', 'immutable', 'metadataOnly',
]);
export const CORE_ENVELOPE_SECURITY_FIELDS = Object.freeze([
  'identityVerified', 'coreConsumed', 'consumerRuntimeInvoked', 'previewMounted', 'productExposed',
]);
export const CORE_ENVELOPE_INVARIANTS = deepFreeze({
  envelopeKind: 'bridge_decision_core_envelope',
  synthetic: true, immutable: true, metadataOnly: true,
  identityVerified: false, coreConsumed: false, consumerRuntimeInvoked: false, previewMounted: false, productExposed: false,
});

// ---- Future validation pipeline stages (fixed order; NOT executed here). ----
export const CORE_ENVELOPE_VALIDATION_STAGES = Object.freeze([
  'source_decision_shape_validation', 'source_digest_presence_validation', 'source_core_extraction_validation',
  'core_field_completeness_validation', 'core_extra_field_validation', 'core_version_validation',
  'target_descriptor_validation', 'same_decision_atomicity_validation', 'digest_recompute_validation',
  'synthetic_boundary_validation', 'security_boundary_validation', 'ssot_boundary_validation',
  'preview_mount_boundary_validation', 'real_data_boundary_validation', 'module_generation_boundary_validation',
  'certification_boundary_validation', 'product_exposure_boundary_validation', 'prototype_reference_validation',
]);

export const CORE_ENVELOPE_ISSUE_SEVERITIES = Object.freeze(['blocker', 'error', 'warning', 'info']);
export const CORE_ENVELOPE_DECISION_STATUSES = Object.freeze(['core_envelope_identity_accepted', 'core_envelope_identity_rejected']);
export const CORE_ENVELOPE_READINESS_STATES = Object.freeze([
  'studio_bridge_decision_core_envelope_contract_ready_for_enterprise_audit', 'needs_contract_fix', 'blocked', 'invalid',
]);

export const CORE_ENVELOPE_ISSUE_CODES = Object.freeze([
  'CORE_ENVELOPE_MISSING', 'CORE_ENVELOPE_NOT_OBJECT', 'CORE_ENVELOPE_WRONG_KIND', 'CORE_ENVELOPE_VERSION_MISSING',
  'CORE_ENVELOPE_VERSION_MISMATCH', 'CORE_ENVELOPE_VERSION_UNKNOWN', 'CORE_ENVELOPE_DIGEST_MISSING',
  'CORE_ENVELOPE_CORE_MISSING', 'CORE_ENVELOPE_CORE_NOT_OBJECT', 'CORE_ENVELOPE_CORE_MISSING_FIELD',
  'CORE_ENVELOPE_CORE_EXTRA_FIELD', 'CORE_ENVELOPE_CORE_ALIAS_FORBIDDEN', 'CORE_ENVELOPE_CORE_DEFAULT_FORBIDDEN',
  'CORE_ENVELOPE_CORE_COERCION_FORBIDDEN', 'CORE_ENVELOPE_DIGEST_INSIDE_CORE_FORBIDDEN',
  'CORE_ENVELOPE_TARGET_DESCRIPTOR_MISSING', 'CORE_ENVELOPE_TARGET_OUTSIDE_CORE_FORBIDDEN',
  'CORE_ENVELOPE_PARTIAL_CORE_FORBIDDEN', 'CORE_ENVELOPE_DIGEST_MISMATCH', 'CORE_ENVELOPE_CROSS_DECISION_MIX_FORBIDDEN',
  'CORE_ENVELOPE_CORE_REPLACEMENT_FORBIDDEN', 'CORE_ENVELOPE_DIGEST_REPLACEMENT_FORBIDDEN',
  'CORE_ENVELOPE_VERSION_TUPLE_MISMATCH', 'CORE_ENVELOPE_V1_IMPLICIT_UPGRADE_FORBIDDEN',
  'CORE_ENVELOPE_V1_RUNTIME_ACCEPTANCE_FORBIDDEN', 'CORE_ENVELOPE_SOURCE_MUTATION_FORBIDDEN',
  'CORE_ENVELOPE_REFERENCE_RETENTION_FORBIDDEN', 'CORE_ENVELOPE_PARTIAL_ENVELOPE_FORBIDDEN',
  'CORE_ENVELOPE_LIMIT_EXCEEDED', 'CORE_ENVELOPE_UNKNOWN_RESOURCE_DIMENSION', 'CORE_ENVELOPE_EXTENSION_UNNAMESPACED_FORBIDDEN',
  'CORE_ENVELOPE_EXTENSION_MISSING_SCHEMA', 'CORE_ENVELOPE_EXTENSION_CORE_OVERRIDE_FORBIDDEN',
  'CORE_ENVELOPE_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN', 'CORE_ENVELOPE_PROTOTYPE_POLLUTION_KEY_FORBIDDEN',
  'CORE_ENVELOPE_SSOT_INVERSION_FORBIDDEN', 'CORE_ENVELOPE_PERMISSION_INTEGRATION_FORBIDDEN',
  'CORE_ENVELOPE_PREMATURE_RUNTIME_FORBIDDEN', 'CORE_ENVELOPE_PLAN_ALIGNMENT_FALSELY_COMPLETE_FORBIDDEN',
  'CORE_ENVELOPE_MANUAL_GATE_MISSING', 'CORE_ENVELOPE_UNEXPECTED_CONTRACT_FAILURE', 'CORE_ENVELOPE_CONFIG_INVALID',
]);

export const CORE_ENVELOPE_CAPABILITIES = Object.freeze({
  headless: true, devOnly: true, syntheticOnly: true, inMemoryOnly: true, ephemeralOnly: true, deterministic: true,
  immutable: true, failClosed: true, sideEffectFree: true, metadataOnly: true, contractOnly: true,
  realDecisionPreimageCaptured: true, realCoreShapeCaptured: true, coreEqualsRealPreimage: true,
  fullDigestRecomputationPossibleByContract: true, bIdentityClosedByContract: true, bRecomputeInputClosedByContract: true,
  v1ContractPreserved: true, ssotPreserved: true, sourceConsumedReadOnly: true, upstreamsConsumedReadOnly: true,
  // Every implementation/runtime capability MUST remain false.
  coreEnvelopeBuilderImplemented: false, identityVerificationImplemented: false, digestRecomputeExecuted: false,
  validationExecuted: false, consumerRuntimeImplemented: false, coreConsumed: false, sourceDecisionConsumed: false,
  implementationPlanAligned: false, previewPayloadCreated: false, previewMounted: false, appTouched: false,
  routeCreated: false, menuCreated: false, sidebarCreated: false, persistenceImplemented: false,
  filesystemWritesUsed: false, backendAccessed: false, prismaAccessed: false, fetchUsed: false, networkUsed: false,
  realDataRead: false, realDataWrite: false, moduleGenerated: false, moduleRegistered: false,
  certificationPerformed: false, envelopeCanonical: false, productExposed: false, productionAccessed: false,
  stagingAccessed: false, prototypeRelinked: false, permissionModelIntegrated: false, tenantModelIntegrated: false,
  serverSideAuthorizationIntegrated: false,
});

export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

export const SOURCE_CHECKPOINT = 'pr_489_post_merge_deep_enterprise_implementation_plan_audit';
export const SOURCE_DECISION = 'POST_MERGE_REVALIDATION_PASS_AND_IMPLEMENTATION_PLAN_ENTERPRISE_PASS';
export const SELECTED_ARCHITECTURE = 'OPTION_B_FULL_BRIDGE_DECISION_CORE';
export const SOURCE_RECOMMENDATION = 'READY_FOR_BRIDGE_DECISION_ENVELOPE_PREIMAGE_CONTRACT_AMENDMENT';
export const CURRENT_SLICE_AUTHORIZATION = 'bridge_decision_core_envelope_contract_only';
export const REQUIRED_FUTURE_CHECKPOINT = 'post_bridge_decision_core_envelope_contract_enterprise_audit';

export const MAK_STUDIO_CORE_ENVELOPE_CONTRACT_FLAG = 'MAK_STUDIO_CORE_ENVELOPE_CONTRACT';
export const MAK_STUDIO_CORE_ENVELOPE_CONTRACT_VERIFY_FLAG = 'MAK_STUDIO_CORE_ENVELOPE_CONTRACT_VERIFY';

/** @returns {boolean} */
export function isProductionEnv() {
  try {
    const env = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    return env.NODE_ENV === 'production' || env.VITE_ENV === 'production';
  } catch { return true; }
}
/** @returns {boolean} */
export function isStudioCoreEnvelopeContractEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_CORE_ENVELOPE_CONTRACT_FLAG] === '1'; } catch { return false; }
}
/** @returns {boolean} */
export function isStudioCoreEnvelopeContractVerifyEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_CORE_ENVELOPE_CONTRACT_VERIFY_FLAG] === '1'; } catch { return false; }
}
