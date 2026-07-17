/**
 * Config + constants for the STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE CONTRACT.
 *
 * HEADLESS, CONTRACT-ONLY, METADATA-ONLY, SYNTHETIC-ONLY, DETERMINISTIC, FAIL-CLOSED and READ-ONLY over
 * upstreams. It defines the contract between the Authoring Runtime's `synthetic_preview_candidate`
 * handoff and the Module Preview Sandbox contract — strict source validation, target-shape metadata,
 * field mapping, version compatibility, FNV-1a digest semantics, canonicalization, fail-closed
 * validation, extensibility, replay/idempotency, SSOT/certification boundaries, permission/tenancy
 * boundary, security limits, prototype-relink prohibition, upstream hardening notes, a manual gate and
 * readiness.
 *
 * It IMPLEMENTS NO bridge, NO adapter, NO source validation runtime, NO target payload, NO preview
 * mount. It creates NO UI, editor, React component, `.jsx`/`.tsx`/`.css`, App/router/menu/sidebar
 * wiring; it never persists, writes the filesystem, touches backend/Prisma/migration/network/
 * production/staging, reads/writes real data, generates/registers a module, certifies/self-certifies/
 * overwrites the certified SSOT, and NEVER relinks the old Studio prototype. The certified blueprint
 * remains the canonical SSOT.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const BRIDGE_CONTRACT_NAME = 'studio-authoring-runtime-to-preview-bridge-contract';
export const BRIDGE_CONTRACT_SEMVER = '1.0.0';
export const BRIDGE_CONTRACT_VERSION = 'studio-authoring-runtime-to-preview-bridge-contract@1.0.0';
export const BRIDGE_CONTRACT_MODE = 'headless_authoring_runtime_to_preview_bridge_contract';

/** Upstream references (consumed read-only). */
export const AUTHORING_RUNTIME_VERSION = 'studio-module-blueprint-authoring-runtime@1.0.0';
export const AUTHORING_IMPLEMENTATION_PLAN_VERSION = 'studio-module-blueprint-authoring-implementation-plan@1.0.0';
export const AUTHORING_FOUNDATION_CONTRACT_VERSION = 'studio-module-blueprint-authoring-foundation-contract@1.0.0';
export const PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** The manual checkpoint a future real bridge implementation slice will require. */
export const REQUIRED_FUTURE_CHECKPOINT = 'pre_authoring_runtime_to_preview_bridge_implementation_enterprise_checkpoint';

/** The source handoff kind this bridge accepts. */
export const SOURCE_HANDOFF_KIND = 'synthetic_preview_candidate';
/** The target descriptor kind this bridge would emit. */
export const TARGET_SANDBOX_KIND = 'module_preview_sandbox_candidate';

/** Critical fields that MUST be present on a valid source handoff (mapping is lossless). */
export const CRITICAL_SOURCE_FIELDS = Object.freeze([
  'handoffKind', 'draftId', 'draftRevision', 'draftDigest', 'runtimeVersion', 'upstreamVersions',
  'synthetic', 'immutable', 'validated', 'payload', 'digest',
]);

/** The mapped fields (source -> target), in fixed deterministic order. */
export const BRIDGE_FIELD_MAPPINGS = Object.freeze([
  { sourceField: 'handoffKind', targetField: 'sourceHandoffKind', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'draftId', targetField: 'candidateDraftId', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'draftRevision', targetField: 'candidateDraftRevision', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'draftDigest', targetField: 'candidateDraftDigest', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'runtimeVersion', targetField: 'sourceRuntimeVersion', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'upstreamVersions', targetField: 'sourceUpstreamVersions', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'synthetic', targetField: 'synthetic', required: true, transformKind: 'assert_true', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'immutable', targetField: 'immutable', required: true, transformKind: 'assert_true', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'validated', targetField: 'validated', required: true, transformKind: 'assert_true', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'payload', targetField: 'syntheticPayload', required: true, transformKind: 'clone_synthetic', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'digest', targetField: 'sourceDigest', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
]);

/** Allowed transform kinds; anything else fails closed. */
export const ALLOWED_TRANSFORM_KINDS = Object.freeze(['identity', 'assert_true', 'clone_synthetic']);

/** Validation pipeline stages, fixed deterministic order. */
export const BRIDGE_VALIDATION_STAGES = Object.freeze([
  'source_shape_validation', 'source_identity_validation', 'source_version_validation',
  'source_digest_validation', 'source_synthetic_boundary_validation', 'source_ssot_boundary_validation',
  'mapping_contract_validation', 'target_version_validation', 'target_shape_validation',
  'product_exposure_validation', 'module_generation_validation', 'certification_boundary_validation',
  'prototype_reference_validation',
]);

/** Issue severities (ascending order for stable sort). */
export const BRIDGE_ISSUE_SEVERITIES = Object.freeze(['info', 'warning', 'error', 'blocker']);

/** Capability flags that an extension can NEVER override. */
export const EXTENSION_PROTECTED_FIELDS = Object.freeze([
  'synthetic', 'validated', 'canonical', 'certified', 'productExposed', 'moduleGenerated',
  'realDataAttached', 'digest', 'runtimeVersion', 'targetContractVersion', 'upstreamVersions',
]);

/** Old Studio prototype paths that must NEVER be relinked/imported. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Readiness classifications the contract can emit. */
export const BRIDGE_CONTRACT_READINESS_STATES = Object.freeze([
  'studio_authoring_runtime_to_preview_bridge_contract_ready',
  'ready_for_bridge_implementation_plan_only',
  'needs_authoring_runtime_fix', 'needs_preview_sandbox_contract_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT_FLAG = 'MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT';
export const MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG = 'MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY';

/**
 * Immutable capability flags. Every headless/contract capability is TRUE; every bridge-implementation /
 * adapter / payload / preview-mount / UI / persistence / backend / production / real-data /
 * certification / product-exposure / permission-tenancy capability is FALSE.
 */
export const BRIDGE_CONTRACT_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  syntheticOnly: true,
  devOnly: true,
  deterministic: true,
  failClosed: true,
  ssotPreserved: true,
  sourceConsumedReadOnly: true,
  targetContractConsumedReadOnly: true,
  bridgeImplemented: false,
  adapterImplemented: false,
  sourceValidationImplemented: false,
  targetPayloadCreated: false,
  previewPayloadCreated: false,
  previewMounted: false,
  authoringUiImplemented: false,
  editorImplemented: false,
  appTouched: false,
  routeCreated: false,
  menuCreated: false,
  sidebarCreated: false,
  persistenceImplemented: false,
  storageUsed: false,
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

/** Deterministic digest (FNV-1a via the runtime generic-model helper). Never mutates input. */
export function bridgeDigest(value) {
  return createGenericModelChecksum({ value: value ?? null });
}

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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioAuthoringRuntimeToPreviewBridgeContractEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_CONTRACT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioAuthoringRuntimeToPreviewBridgeVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_VERIFY_FLAG);
}

export default {
  BRIDGE_CONTRACT_VERSION,
  BRIDGE_CONTRACT_CAPABILITIES,
};
