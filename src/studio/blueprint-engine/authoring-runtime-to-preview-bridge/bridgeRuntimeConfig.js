/**
 * Config + constants for the STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE (the REAL headless bridge).
 *
 * HEADLESS, DEV-ONLY, SYNTHETIC-ONLY, IN-MEMORY, EPHEMERAL, DETERMINISTIC, IMMUTABLE, FAIL-CLOSED and
 * SIDE-EFFECT-FREE. It consumes — READ-ONLY — the corrected Bridge Contract (real source fields, field
 * mappings, version tuple, digest semantics, extension policy), the Bridge Implementation Plan (resource
 * limits), and the Authoring Runtime serializer + digest helper (`stableSerialize` +
 * `createDeterministicDigest`). It transforms a REAL Authoring Runtime `synthetic_preview_candidate`
 * handoff into a SYNTHETIC `module_preview_sandbox_candidate` target descriptor (metadata only).
 *
 * It mounts NO preview, creates NO UI/editor/React/`.jsx`/`.tsx`/`.css`, touches NO App/router/menu/
 * sidebar, persists nothing, writes no filesystem, touches no backend/Prisma/migration/network/production/
 * staging, reads/writes no real data, generates/registers no module, certifies/overwrites no SSOT, and
 * NEVER relinks the old Studio prototype. It does NOT locate drafts and NEVER calls `findDraft`; it
 * receives a ready handoff and an explicit `expectedDraftId`.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

import {
  AUTHORING_RUNTIME_VERSION, PREVIEW_SANDBOX_CONTRACT_VERSION, BRIDGE_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION, AUTHORING_IMPLEMENTATION_PLAN_VERSION, SOURCE_HANDOFF_KIND, TARGET_SANDBOX_KIND,
  REAL_HANDOFF_FIELDS, FORBIDDEN_LEGACY_SOURCE_FIELDS, SOURCE_HANDOFF_REQUIRED_FIELDS,
  SOURCE_HANDOFF_SECURITY_FIELDS, SOURCE_HANDOFF_VERSION_FIELDS, SOURCE_HANDOFF_DIGEST_FIELDS,
  BRIDGE_FIELD_MAPPINGS, ALLOWED_TRANSFORM_KINDS, BRIDGE_VALIDATION_STAGES, BRIDGE_ISSUE_SEVERITIES,
  EXTENSION_PROTECTED_FIELDS,
} from '../authoring-runtime-to-preview-bridge-contract/index.js';
import { DEFAULT_BRIDGE_RESOURCE_LIMITS, BRIDGE_RESOURCE_LIMIT_DIMENSIONS, BRIDGE_IMPLEMENTATION_PLAN_VERSION } from '../authoring-runtime-to-preview-bridge-implementation-plan/index.js';

export const BRIDGE_NAME = 'studio-authoring-runtime-to-preview-bridge';
export const BRIDGE_SEMVER = '1.0.0';
export const BRIDGE_VERSION = 'studio-authoring-runtime-to-preview-bridge@1.0.0';
export const BRIDGE_MODE = 'headless_authoring_runtime_to_preview_bridge';

/** Handoff version the real runtime emits (from createSyntheticPreviewHandoff). */
export const SOURCE_HANDOFF_VERSION = 'authoring-preview-handoff@1.0.0';

/** Upstream references (consumed READ-ONLY). Re-exported from the corrected contract/plan. */
export {
  AUTHORING_RUNTIME_VERSION, PREVIEW_SANDBOX_CONTRACT_VERSION, BRIDGE_CONTRACT_VERSION,
  BLUEPRINT_CONTRACT_VERSION, AUTHORING_IMPLEMENTATION_PLAN_VERSION, BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  SOURCE_HANDOFF_KIND, TARGET_SANDBOX_KIND, REAL_HANDOFF_FIELDS, FORBIDDEN_LEGACY_SOURCE_FIELDS,
  SOURCE_HANDOFF_REQUIRED_FIELDS, SOURCE_HANDOFF_SECURITY_FIELDS, SOURCE_HANDOFF_VERSION_FIELDS,
  SOURCE_HANDOFF_DIGEST_FIELDS, BRIDGE_FIELD_MAPPINGS, ALLOWED_TRANSFORM_KINDS, BRIDGE_VALIDATION_STAGES,
  BRIDGE_ISSUE_SEVERITIES, EXTENSION_PROTECTED_FIELDS, DEFAULT_BRIDGE_RESOURCE_LIMITS,
  BRIDGE_RESOURCE_LIMIT_DIMENSIONS,
};

/** The source checkpoint + decision that authorized this real bridge implementation. */
export const SOURCE_CHECKPOINT = 'revalidation_pre_authoring_runtime_to_preview_bridge_implementation_enterprise_checkpoint';
export const SOURCE_DECISION = 'READY_FOR_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_SLICE';
/** The next manual enterprise checkpoint required before any further step (UI etc). */
export const REQUIRED_FUTURE_CHECKPOINT = 'post_authoring_runtime_to_preview_bridge_enterprise_checkpoint';

/** The default expected version tuple (exact match required). */
export const DEFAULT_EXPECTED_VERSIONS = Object.freeze({
  handoffVersion: SOURCE_HANDOFF_VERSION,
  runtimeVersion: AUTHORING_RUNTIME_VERSION,
  targetSandboxVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
  bridgeContractVersion: BRIDGE_CONTRACT_VERSION,
  bridgeImplementationPlanVersion: BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  blueprintContractVersion: BLUEPRINT_CONTRACT_VERSION,
});

/** Deterministic decision statuses. */
export const BRIDGE_DECISION_STATUSES = Object.freeze(['bridge_ready', 'bridge_rejected']);

/** Deterministic issue codes emitted by the bridge. */
export const BRIDGE_ISSUE_CODES = Object.freeze([
  // Draft identity.
  'BRIDGE_EXPECTED_DRAFT_ID_REQUIRED', 'BRIDGE_SOURCE_DRAFT_ID_REQUIRED', 'BRIDGE_SOURCE_DRAFT_ID_MISMATCH',
  'BRIDGE_AMBIGUOUS_DRAFT_ID_FORBIDDEN',
  // Shape.
  'BRIDGE_SOURCE_NOT_OBJECT', 'BRIDGE_SOURCE_WRONG_HANDOFF_KIND', 'BRIDGE_SOURCE_MISSING_REQUIRED_FIELD',
  'BRIDGE_SOURCE_WRONG_TYPE', 'BRIDGE_SOURCE_LEGACY_ALIAS_FORBIDDEN', 'BRIDGE_SOURCE_UNKNOWN_CRITICAL_FIELD',
  'BRIDGE_SOURCE_NOT_OK', 'BRIDGE_SOURCE_NOT_VALIDATED', 'BRIDGE_SOURCE_NOT_SYNTHETIC',
  'BRIDGE_SOURCE_NOT_IMMUTABLE', 'BRIDGE_SOURCE_PREVIEW_PAYLOAD_NOT_CREATED', 'BRIDGE_SOURCE_REVISION_INVALID',
  'BRIDGE_SOURCE_PAYLOAD_INVALID',
  // Security boundary.
  'BRIDGE_SOURCE_PREVIEW_MOUNTED_FORBIDDEN', 'BRIDGE_SOURCE_REAL_DATA_ATTACHED_FORBIDDEN',
  'BRIDGE_SOURCE_ROUTE_CREATED_FORBIDDEN', 'BRIDGE_SOURCE_MENU_CREATED_FORBIDDEN',
  'BRIDGE_SOURCE_PRODUCT_EXPOSED_FORBIDDEN',
  // Version tuple.
  'BRIDGE_VERSION_MISSING', 'BRIDGE_VERSION_UNKNOWN', 'BRIDGE_SOURCE_RUNTIME_VERSION_MISMATCH',
  'BRIDGE_HANDOFF_VERSION_MISMATCH', 'BRIDGE_TARGET_SANDBOX_VERSION_MISMATCH',
  'BRIDGE_CONTRACT_VERSION_MISMATCH', 'BRIDGE_PLAN_VERSION_MISMATCH', 'BRIDGE_BLUEPRINT_CONTRACT_VERSION_MISMATCH',
  'BRIDGE_AGGREGATED_UPSTREAM_VERSIONS_FORBIDDEN', 'BRIDGE_VERSION_DOWNGRADE_FORBIDDEN',
  // Digest.
  'BRIDGE_SOURCE_HANDOFF_DIGEST_REQUIRED', 'BRIDGE_SOURCE_HANDOFF_DIGEST_MISMATCH',
  'BRIDGE_GENERIC_DIGEST_FIELD_FORBIDDEN',
  // SSOT boundary.
  'BRIDGE_SOURCE_CANONICAL_FORBIDDEN', 'BRIDGE_SOURCE_CERTIFIED_FORBIDDEN', 'BRIDGE_SSOT_INVERSION_FORBIDDEN',
  // Mappings.
  'BRIDGE_MAPPING_SOURCE_FIELD_MISSING', 'BRIDGE_MAPPING_UNKNOWN_TRANSFORM', 'BRIDGE_MAPPING_CRITICAL_DEFAULT_FORBIDDEN',
  'BRIDGE_MAPPING_LOSSY_CRITICAL_FORBIDDEN', 'BRIDGE_MAPPING_DUPLICATE_FORBIDDEN', 'BRIDGE_MAPPING_ASSERT_TRUE_FAILED',
  'BRIDGE_MAPPING_INVENTED_SOURCE_FIELD', 'BRIDGE_MAPPING_INVENTED_TARGET_FIELD',
  // Target.
  'BRIDGE_TARGET_WRONG_KIND', 'BRIDGE_TARGET_WRONG_VERSION', 'BRIDGE_TARGET_NOT_METADATA_ONLY',
  'BRIDGE_TARGET_MOUNTED_FORBIDDEN', 'BRIDGE_TARGET_ROUTE_MENU_FORBIDDEN', 'BRIDGE_TARGET_PRODUCT_EXPOSED_FORBIDDEN',
  'BRIDGE_TARGET_NOT_SERIALIZABLE', 'BRIDGE_TARGET_MODULE_GENERATED_FORBIDDEN', 'BRIDGE_TARGET_PERSISTENCE_FORBIDDEN',
  // Product / module / certification / prototype.
  'BRIDGE_PRODUCT_EXPOSURE_FORBIDDEN', 'BRIDGE_MODULE_GENERATION_FORBIDDEN', 'BRIDGE_CERTIFICATION_FORBIDDEN',
  'BRIDGE_PROTOTYPE_REFERENCE_FORBIDDEN',
  // Extensions.
  'BRIDGE_EXTENSION_UNNAMESPACED_FORBIDDEN', 'BRIDGE_EXTENSION_MISSING_SCHEMA', 'BRIDGE_EXTENSION_DUPLICATE_NAMESPACE',
  'BRIDGE_EXTENSION_CRITICAL_OVERRIDE_FORBIDDEN', 'BRIDGE_EXTENSION_CAPABILITY_OVERRIDE_FORBIDDEN',
  'BRIDGE_EXTENSION_UNKNOWN_CRITICAL_FIELD', 'BRIDGE_EXTENSION_LIMIT_EXCEEDED',
  // Resource limits (mirror the plan's coherence issueCodes).
  'BRIDGE_UNKNOWN_RESOURCE_DIMENSION', 'BRIDGE_SOURCE_PAYLOAD_TOO_LARGE', 'BRIDGE_SOURCE_FIELDS_TOO_MANY',
  'BRIDGE_SOURCE_LAYOUT_SECTIONS_TOO_MANY', 'BRIDGE_SOURCE_RELATIONSHIPS_TOO_MANY',
  'BRIDGE_VALIDATION_ISSUES_TOO_MANY', 'BRIDGE_EXTENSIONS_TOO_MANY', 'BRIDGE_STRING_TOO_LONG',
  // Config.
  'BRIDGE_CONFIG_INVALID',
]);

/** Extra target descriptor fields the Bridge Contract declares the bridge may emit. */
export const TARGET_DESCRIPTOR_TARGET_FIELDS = Object.freeze([
  'sourceHandoffKind', 'candidateDraftId', 'candidateDraftRevision', 'candidateDraftDigest',
  'sourceRuntimeVersion', 'sourceHandoffVersion', 'sourceTargetSandboxVersion', 'synthetic', 'immutable',
  'validated', 'syntheticPayload', 'sourceDigest',
]);

/**
 * Immutable capability flags. Every implemented headless-bridge capability is TRUE; every UI / mount /
 * persistence / backend / real-data / module / certification / product-exposure / permission-tenancy
 * capability is FALSE.
 */
export const BRIDGE_CAPABILITIES = Object.freeze({
  headless: true,
  devOnly: true,
  syntheticOnly: true,
  inMemoryOnly: true,
  ephemeralOnly: true,
  deterministic: true,
  immutable: true,
  failClosed: true,
  sideEffectFree: true,
  ssotPreserved: true,
  sourceConsumedReadOnly: true,
  contractConsumedReadOnly: true,
  runtimeSerializerReusedReadOnly: true,
  // Implemented (this slice).
  bridgeImplemented: true,
  sourceValidationImplemented: true,
  draftIdentityEnforcementImplemented: true,
  sourceVersionValidationImplemented: true,
  sourceDigestValidationImplemented: true,
  sourceBoundaryValidationImplemented: true,
  mappingExecutorImplemented: true,
  targetDescriptorBuilderImplemented: true,
  targetVersionValidationImplemented: true,
  canonicalizationValidationImplemented: true,
  extensibilityEnforcementImplemented: true,
  validationPipelineImplemented: true,
  replayIdempotencyImplemented: true,
  resourceLimitsImplemented: true,
  failureContainmentImplemented: true,
  // Never (forbidden).
  previewPayloadCreated: false,
  previewMounted: false,
  appTouched: false,
  routeCreated: false,
  menuCreated: false,
  sidebarCreated: false,
  persistenceImplemented: false,
  filesystemWritesUsed: false,
  backendAccessed: false,
  prismaAccessed: false,
  fetchUsed: false,
  networkUsed: false,
  realDataRead: false,
  realDataWrite: false,
  moduleGenerated: false,
  moduleRegistered: false,
  certificationPerformed: false,
  candidateCanonical: false,
  productExposed: false,
  productionAccessed: false,
  stagingAccessed: false,
  prototypeRelinked: false,
  permissionModelIntegrated: false,
  tenantModelIntegrated: false,
  serverSideAuthorizationIntegrated: false,
});

/** Readiness classifications the bridge can emit. */
export const BRIDGE_READINESS_STATES = Object.freeze([
  'studio_authoring_runtime_to_preview_bridge_ready',
  'needs_bridge_fix', 'blocked', 'invalid',
]);

/** Old Studio prototype paths that must NEVER be relinked/imported. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

export const MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_FLAG = 'MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE';
export const MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG = 'MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY';

/** @returns {Record<string, unknown>} */
function resolveEnv() {
  /** @type {Record<string, unknown>} */
  let metaEnv = {};
  try {
    metaEnv = (typeof import.meta !== 'undefined' && import.meta.env) ? import.meta.env : {};
  } catch {
    metaEnv = {};
  }
  const proc = (typeof globalThis !== 'undefined' && globalThis.process) ? globalThis.process : undefined;
  const procEnv = proc && proc.env ? proc.env : {};
  return { ...procEnv, ...metaEnv };
}

/** @param {Record<string, unknown>} env @returns {boolean} */
export function isProductionEnv(env) {
  if (env.DEV === true || env.DEV === 'true') return false;
  const label = String(env.MAK_ENV_LABEL || env.VITE_ENV_LABEL || '').toLowerCase();
  if (label === 'production') return true;
  if (label && label !== 'production') return false;
  const mode = String(env.MODE || '').toLowerCase();
  if (mode === 'production') return true;
  if (mode && mode !== 'production') return false;
  const nodeEnv = String(env.NODE_ENV || '').toLowerCase();
  if (nodeEnv === 'production') return true;
  if (env.PROD === true || env.PROD === 'true') return true;
  return false;
}

/** @param {Record<string, unknown>} env @param {string} flag @returns {boolean} */
function flagEnabled(env, flag) {
  const requested = env[flag] === 'true' || env[MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioAuthoringRuntimeToPreviewBridgeEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioAuthoringRuntimeToPreviewBridgeVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG);
}

export default {
  BRIDGE_VERSION,
  BRIDGE_CAPABILITIES,
};
