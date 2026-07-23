/**
 * STUDIO BRIDGE DECISION CORE ENVELOPE BUILDER CONTRACT — configuration.
 *
 * CONTRACT ONLY. Declares the headless, deterministic, immutable, fail-closed, dev-only contract for a FUTURE
 * builder that receives a real hardened `bridgeDecision`, checks success eligibility, extracts the EXACT digest
 * preimage as `bridgeDecisionCore` by real allowlist, recomputes and confirms `bridgeDecisionDigest`, and emits a
 * Core Envelope v2 atomically. It reflects the REAL merged upstream shapes/versions/arrays READ-ONLY and
 * implements NO builder — every implementation flag is false. It declares the pre-implementation blocker
 * B-CORE-ENVELOPE-BUILDER and, where the v2 `identityVerified` invariant conflicts with a builder-emitted
 * verified state, the open blocker B-CORE-ENVELOPE-VERIFICATION-STATE.
 */
import {
  REAL_BRIDGE_DECISION_FIELDS, REAL_BRIDGE_DECISION_REQUIRED_FIELDS, REAL_BRIDGE_DECISION_IDENTITY_FIELDS,
  REAL_BRIDGE_DECISION_SECURITY_FIELDS, REAL_BRIDGE_DECISION_TARGET_FIELDS, DECISION_DIGEST_PREIMAGE_FIELDS,
  ENVELOPE_CONTRACT_VERSION as ENVELOPE_V1_CONTRACT_VERSION,
} from '../bridge-decision-envelope-identity-contract/index.js';
import {
  CORE_ENVELOPE_CONTRACT_VERSION, CORE_ENVELOPE_KIND, CORE_ENVELOPE_VERSION_TAG, CORE_ENVELOPE_FIELDS,
  CORE_ENVELOPE_INVARIANTS, CORE_FIELD_COUNT, REQUIRED_CORE_FIELDS, REAL_TARGET_DESCRIPTOR_FIELDS_REF,
  SOURCE_BRIDGE_RUNTIME_VERSION_REF, SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF, SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2,
} from '../bridge-decision-core-envelope-contract/index.js';
import { AMENDMENT_VERSION as PLAN_ALIGNMENT_AMENDMENT_VERSION } from '../bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment/index.js';
import { deepFreeze } from './deepFreeze.js';

export const BUILDER_CONTRACT_NAME = 'studio-bridge-decision-core-envelope-builder-contract';
export const BUILDER_CONTRACT_SEMVER = '1.0.0';
export const BUILDER_CONTRACT_VERSION = `${BUILDER_CONTRACT_NAME}@${BUILDER_CONTRACT_SEMVER}`;
export const BUILDER_CONTRACT_MODE = 'headless_bridge_decision_core_envelope_builder_contract';
export const BUILDER_KIND = 'bridge_decision_core_envelope_builder';
export const FUTURE_BUILDER_FACTORY = 'createBridgeDecisionCoreEnvelopeBuilder';

// ---- Real upstream versions (read-only, reflected). ----
export const SOURCE_CORE_ENVELOPE_CONTRACT_VERSION = CORE_ENVELOPE_CONTRACT_VERSION;
export const SOURCE_ENVELOPE_V1_CONTRACT_VERSION = ENVELOPE_V1_CONTRACT_VERSION;
export const SOURCE_PLAN_ALIGNMENT_AMENDMENT_VERSION = PLAN_ALIGNMENT_AMENDMENT_VERSION;
export const SOURCE_BRIDGE_RUNTIME_VERSION = SOURCE_BRIDGE_RUNTIME_VERSION_REF;
export const SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION = SOURCE_TARGET_SANDBOX_CONTRACT_VERSION_REF;
export const SOURCE_BLUEPRINT_CONTRACT_VERSION = SOURCE_BLUEPRINT_CONTRACT_VERSION_REF2;

// ---- Real source bridge DECISION shape (reflected READ-ONLY; counts derived). ----
export const REAL_SOURCE_BRIDGE_DECISION_FIELDS = Object.freeze([...REAL_BRIDGE_DECISION_FIELDS]);
export const REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS = Object.freeze([...REAL_BRIDGE_DECISION_REQUIRED_FIELDS]);
export const SOURCE_IDENTITY_FIELDS = Object.freeze([...REAL_BRIDGE_DECISION_IDENTITY_FIELDS]);
export const SOURCE_SECURITY_FIELDS = Object.freeze([...REAL_BRIDGE_DECISION_SECURITY_FIELDS]);
export const SOURCE_TARGET_FIELDS = Object.freeze([...REAL_BRIDGE_DECISION_TARGET_FIELDS]);
export const SOURCE_VERSION_FIELDS = Object.freeze(['bridgeVersion']);
export const SOURCE_SUCCESS_ELIGIBILITY_FIELDS = Object.freeze(['ok', 'status', 'targetDescriptorCreated', 'targetDescriptor', 'bridgeDecisionDigest']);
export const SOURCE_DECISION_KIND = 'bridge-decision';
export const SOURCE_DECISION_SUCCESS_STATUS = 'bridge_ready';
export const SOURCE_DIGEST_FIELD = 'bridgeDecisionDigest';

// ---- Core / preimage (the exact allowlist for extraction). ----
export const DIGEST_PREIMAGE_ALLOWLIST = Object.freeze([...DECISION_DIGEST_PREIMAGE_FIELDS]);
export const REQUIRED_CORE_FIELDS_REF = Object.freeze([...REQUIRED_CORE_FIELDS]);
export const CORE_FIELD_COUNT_REF = CORE_FIELD_COUNT; // 32, derived upstream

// ---- Output envelope (v2) reflected. ----
export const OUTPUT_CORE_ENVELOPE_FIELDS = Object.freeze([...CORE_ENVELOPE_FIELDS]);
export const OUTPUT_CORE_ENVELOPE_INVARIANTS = deepFreeze({ ...CORE_ENVELOPE_INVARIANTS });
export const OUTPUT_CORE_ENVELOPE_KIND = CORE_ENVELOPE_KIND;
export const OUTPUT_CORE_ENVELOPE_VERSION_TAG = CORE_ENVELOPE_VERSION_TAG;
export const OUTPUT_TARGET_DESCRIPTOR_FIELDS = Object.freeze([...REAL_TARGET_DESCRIPTOR_FIELDS_REF]);

// ---- Future builder decision statuses (declared; NOT produced). ----
export const BUILDER_DECISION_STATUSES = Object.freeze(['core_envelope_ready', 'core_envelope_rejected']);

export const BUILDER_ISSUE_SEVERITIES = Object.freeze(['blocker', 'error', 'warning', 'info']);
export const BUILDER_READINESS_STATES = Object.freeze([
  'studio_bridge_decision_core_envelope_builder_contract_ready_for_enterprise_audit',
  'needs_contract_fix', 'blocked', 'invalid',
]);
export const BUILDER_MAX_STRUCTURE_DEPTH = 64;

export const BUILDER_ISSUE_CODES = Object.freeze([
  'BUILDER_SOURCE_REQUIRED', 'BUILDER_SOURCE_STRUCTURE_CYCLE', 'BUILDER_SOURCE_STRUCTURE_TOO_DEEP',
  'BUILDER_SOURCE_UNSUPPORTED_VALUE', 'BUILDER_SOURCE_NON_PLAIN_OBJECT', 'BUILDER_SOURCE_SPARSE_ARRAY',
  'BUILDER_SOURCE_ACCESSOR_FORBIDDEN', 'BUILDER_SOURCE_PROTOTYPE_POLLUTION_KEY', 'BUILDER_SOURCE_KIND_MISMATCH',
  'BUILDER_SOURCE_NOT_READY', 'BUILDER_SOURCE_INVENTED_FIELD', 'BUILDER_TARGET_DESCRIPTOR_REQUIRED',
  'BUILDER_DIGEST_REQUIRED', 'BUILDER_CORE_FIELD_MISSING', 'BUILDER_CORE_FIELD_EXTRA', 'BUILDER_CORE_ALIAS_FORBIDDEN',
  'BUILDER_CORE_DEFAULT_FORBIDDEN', 'BUILDER_CORE_COERCION_FORBIDDEN', 'BUILDER_DIGEST_INSIDE_CORE_FORBIDDEN',
  'BUILDER_DIGEST_MISMATCH', 'BUILDER_CROSS_DECISION_MIX_FORBIDDEN', 'BUILDER_SOURCE_VERSION_MISMATCH',
  'BUILDER_ENVELOPE_VERSION_UNSUPPORTED', 'BUILDER_ENVELOPE_INVENTED_FIELD', 'BUILDER_IDENTITY_VERIFICATION_STATE_INVALID',
  'BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', 'BUILDER_SOURCE_MUTATION_FORBIDDEN', 'BUILDER_PARTIAL_CORE_FORBIDDEN',
  'BUILDER_PARTIAL_ENVELOPE_FORBIDDEN', 'BUILDER_LIMIT_EXCEEDED', 'BUILDER_UNKNOWN_RESOURCE_DIMENSION',
  'BUILDER_EXTENSION_CORE_OVERRIDE_FORBIDDEN', 'BUILDER_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN',
  'BUILDER_PROTOTYPE_POLLUTION_KEY_FORBIDDEN', 'BUILDER_SSOT_INVERSION_FORBIDDEN', 'BUILDER_PERMISSION_INTEGRATION_FORBIDDEN',
  'BUILDER_PREMATURE_RUNTIME_FORBIDDEN', 'BUILDER_MANUAL_GATE_MISSING', 'BUILDER_UNEXPECTED_EXECUTION_FAILURE',
  'BUILDER_CONFIG_INVALID',
]);

export const BUILDER_CAPABILITIES = Object.freeze({
  headless: true, devOnly: true, syntheticOnly: true, inMemoryOnly: true, ephemeralOnly: true, deterministic: true,
  immutable: true, failClosed: true, sideEffectFree: true, metadataOnly: true, contractOnly: true,
  realSourceBridgeDecisionShapeCaptured: true, realCorePreimageAllowlistCaptured: true, realOutputEnvelopeCaptured: true,
  ssotPreserved: true, sourceConsumedReadOnly: true, upstreamsConsumedReadOnly: true,
  bIdentityClosedByContract: true, bRecomputeInputClosedByContract: true, bRecomputeInputResolvedByPlan: true,
  // Every builder / runtime capability MUST remain false.
  builderFactoryImplemented: false, buildImplemented: false, coreExtractionImplemented: false,
  digestRecomputeImplemented: false, identityVerificationImplemented: false, envelopeConstructionImplemented: false,
  consumerRuntimeImplemented: false, validationExecuted: false, builderExecuted: false, sourceDecisionConsumed: false,
  coreExtracted: false, coreEnvelopeCreated: false, previewPayloadCreated: false, previewMounted: false,
  appTouched: false, routeCreated: false, menuCreated: false, sidebarCreated: false, persistenceImplemented: false,
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
export const FORBIDDEN_PROTOTYPE_KEYS = Object.freeze(['__proto__', 'constructor', 'prototype']);

export const SOURCE_CHECKPOINT = 'pr_491_post_merge_deep_enterprise_plan_alignment_audit';
export const SOURCE_DECISION = 'POST_MERGE_REVALIDATION_PASS_AND_PLAN_ALIGNMENT_ENTERPRISE_PASS';
export const SOURCE_RECOMMENDATION = 'READY_FOR_BRIDGE_DECISION_CORE_ENVELOPE_BUILDER_CONTRACT';
export const SELECTED_ARCHITECTURE = 'OPTION_B_FULL_BRIDGE_DECISION_CORE';
export const CURRENT_SLICE_AUTHORIZATION = 'core_envelope_builder_contract_only';
export const REQUIRED_FUTURE_CHECKPOINT = 'post_core_envelope_builder_contract_enterprise_audit';

export const MAK_STUDIO_CORE_ENVELOPE_BUILDER_CONTRACT_FLAG = 'MAK_STUDIO_CORE_ENVELOPE_BUILDER_CONTRACT';
export const MAK_STUDIO_CORE_ENVELOPE_BUILDER_CONTRACT_VERIFY_FLAG = 'MAK_STUDIO_CORE_ENVELOPE_BUILDER_CONTRACT_VERIFY';

/** @returns {boolean} */
export function isProductionEnv() {
  try {
    const env = (typeof globalThis !== 'undefined' && globalThis.process && globalThis.process.env) ? globalThis.process.env : {};
    return env.NODE_ENV === 'production' || env.VITE_ENV === 'production';
  } catch { return true; }
}
/** @returns {boolean} */
export function isStudioCoreEnvelopeBuilderContractEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_CORE_ENVELOPE_BUILDER_CONTRACT_FLAG] === '1'; } catch { return false; }
}
/** @returns {boolean} */
export function isStudioCoreEnvelopeBuilderContractVerifyEnabled() {
  if (isProductionEnv()) return false;
  try { return globalThis.process.env[MAK_STUDIO_CORE_ENVELOPE_BUILDER_CONTRACT_VERIFY_FLAG] === '1'; } catch { return false; }
}
