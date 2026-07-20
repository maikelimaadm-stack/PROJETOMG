/**
 * Config + constants for the STUDIO AUTHORING RUNTIME-TO-PREVIEW BRIDGE IMPLEMENTATION PLAN.
 *
 * Despite the name, this layer is HEADLESS, CONTRACT-ONLY, METADATA-ONLY, PLAN-ONLY, SYNTHETIC-ONLY,
 * DETERMINISTIC, FAIL-CLOSED and READ-ONLY over its upstreams. It consumes the Authoring Runtime-to-
 * Preview Bridge Contract (read-only) and produces the deterministic PLAN for a FUTURE headless bridge —
 * implementation phases, source-validation plan, strict draft-identity enforcement plan, source/target
 * version validation plans, digest-consistency plan, source boundary plan, field-mapping execution plan,
 * target descriptor construction plan, canonicalization + extensibility plans, validation pipeline plan,
 * replay/idempotency plan, resource-limits plan, failure-containment plan, SSOT protection, certification
 * boundary, permission/tenancy boundary, security/safety, prototype-relink assertion, test-harness,
 * manual gate, rollout/rollback, observability and governance registry plans.
 *
 * It IMPLEMENTS NO bridge, adapter, source validator, target payload builder or preview mount. It creates
 * NO UI, editor, React component, `.jsx`/`.tsx`/`.css`, App/router/menu/sidebar wiring; it never persists,
 * writes the filesystem, touches backend/Prisma/migration/network/production/staging, reads/writes real
 * data, generates/registers a module, certifies/self-certifies/overwrites the certified SSOT, integrates a
 * permission/tenant model, and NEVER relinks the old Studio prototype. Default disabled; headless only;
 * fails closed in production; reversible by non-consumption. It authorizes NO bridge implementation slice —
 * only a future, separately-approved slice (after an enterprise checkpoint) may.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const BRIDGE_IMPLEMENTATION_PLAN_NAME = 'studio-authoring-runtime-to-preview-bridge-implementation-plan';
export const BRIDGE_IMPLEMENTATION_PLAN_SEMVER = '1.0.0';
export const BRIDGE_IMPLEMENTATION_PLAN_VERSION = 'studio-authoring-runtime-to-preview-bridge-implementation-plan@1.0.0';
export const BRIDGE_IMPLEMENTATION_PLAN_MODE = 'headless_authoring_runtime_to_preview_bridge_implementation_plan';

/** Upstream references (consumed read-only). */
export const BRIDGE_CONTRACT_VERSION = 'studio-authoring-runtime-to-preview-bridge-contract@1.0.0';
export const AUTHORING_RUNTIME_VERSION = 'studio-module-blueprint-authoring-runtime@1.0.0';
export const AUTHORING_IMPLEMENTATION_PLAN_VERSION = 'studio-module-blueprint-authoring-implementation-plan@1.0.0';
export const AUTHORING_FOUNDATION_CONTRACT_VERSION = 'studio-module-blueprint-authoring-foundation-contract@1.0.0';
export const PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** The manual checkpoint a future real bridge implementation slice will require. */
export const REQUIRED_FUTURE_CHECKPOINT = 'pre_authoring_runtime_to_preview_bridge_implementation_enterprise_checkpoint';

/** The source handoff kind the future bridge accepts. */
export const SOURCE_HANDOFF_KIND = 'synthetic_preview_candidate';
/** The target descriptor kind the future bridge would emit. */
export const TARGET_SANDBOX_KIND = 'module_preview_sandbox_candidate';

/** The planned implementation phases (planned metadata only — none implemented). */
export const BRIDGE_IMPLEMENTATION_PHASE_IDS = Object.freeze([
  'phase_0_preflight',
  'phase_1_bridge_contract_validation',
  'phase_2_scope_registry_preparation',
  'phase_3_source_handoff_shape_validation',
  'phase_4_strict_draft_identity_enforcement',
  'phase_5_source_version_validation',
  'phase_6_source_digest_consistency_validation',
  'phase_7_source_synthetic_ssot_boundary_validation',
  'phase_8_field_mapping_execution',
  'phase_9_target_descriptor_construction',
  'phase_10_target_sandbox_version_validation',
  'phase_11_canonicalization_extensibility_enforcement',
  'phase_12_validation_pipeline_and_failure_containment',
  'phase_13_replay_idempotency_and_resource_limits',
  'phase_14_test_harness_and_manual_gate',
  'phase_15_rollout_blocked',
]);

/**
 * The EXACT field names the real Authoring Runtime `createSyntheticPreviewHandoff` emits — the source of
 * truth every planned source field / mapping is validated against. Explicit version fields + `handoffDigest`;
 * NO aggregated `upstreamVersions`, NO generic `digest`.
 */
export const REAL_HANDOFF_FIELDS = Object.freeze([
  'kind', 'handoffKind', 'handoffVersion', 'runtimeVersion', 'targetSandboxVersion', 'draftId',
  'draftRevision', 'draftDigest', 'synthetic', 'immutable', 'validated', 'previewPayloadCreated',
  'previewMounted', 'realDataAttached', 'routeCreated', 'menuCreated', 'productExposed', 'payload', 'ok',
  'handoffDigest',
]);

/** Source-field names that MUST NOT appear (removed legacy aliases the real handoff never emits). */
export const FORBIDDEN_LEGACY_SOURCE_FIELDS = Object.freeze(['upstreamVersions', 'digest']);

/** Critical (mapped, lossless) source fields — the sourceField of every BRIDGE_FIELD_MAPPING. All real. */
export const CRITICAL_SOURCE_FIELDS = Object.freeze([
  'handoffKind', 'draftId', 'draftRevision', 'draftDigest', 'runtimeVersion', 'handoffVersion',
  'targetSandboxVersion', 'synthetic', 'immutable', 'validated', 'payload', 'handoffDigest',
]);

/** Boundary (security) fields the future validator asserts but never copies to the target. */
export const SOURCE_BOUNDARY_FIELDS = Object.freeze([
  'previewMounted', 'realDataAttached', 'routeCreated', 'menuCreated', 'productExposed',
]);

/** Explicit version fields (real). No aggregated `upstreamVersions`. */
export const SOURCE_HANDOFF_VERSION_FIELDS = Object.freeze(['handoffVersion', 'runtimeVersion', 'targetSandboxVersion']);

/** Digest field (real). No generic `digest`. */
export const SOURCE_HANDOFF_DIGEST_FIELDS = Object.freeze(['handoffDigest']);

/**
 * The field mappings (source -> target) the future executor will run, fixed deterministic order. Count
 * derives from the real model — every sourceField exists in REAL_HANDOFF_FIELDS (no invented alias);
 * security fields are validated not copied; no aggregated `upstreamVersions`, no generic `digest`.
 */
export const BRIDGE_FIELD_MAPPINGS = Object.freeze([
  { sourceField: 'handoffKind', targetField: 'sourceHandoffKind', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'draftId', targetField: 'candidateDraftId', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'draftRevision', targetField: 'candidateDraftRevision', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'draftDigest', targetField: 'candidateDraftDigest', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'runtimeVersion', targetField: 'sourceRuntimeVersion', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'handoffVersion', targetField: 'sourceHandoffVersion', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'targetSandboxVersion', targetField: 'sourceTargetSandboxVersion', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'synthetic', targetField: 'synthetic', required: true, transformKind: 'assert_true', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'immutable', targetField: 'immutable', required: true, transformKind: 'assert_true', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'validated', targetField: 'validated', required: true, transformKind: 'assert_true', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'payload', targetField: 'syntheticPayload', required: true, transformKind: 'clone_synthetic', defaultAllowed: false, losslessRequired: true },
  { sourceField: 'handoffDigest', targetField: 'sourceDigest', required: true, transformKind: 'identity', defaultAllowed: false, losslessRequired: true },
]);

/** Allowed transform kinds; anything else fails closed in the plan. */
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

/** Capability flags an extension can NEVER override. Uses real field names (no legacy aliases). */
export const EXTENSION_PROTECTED_FIELDS = Object.freeze([
  'synthetic', 'validated', 'canonical', 'certified', 'productExposed', 'moduleGenerated',
  'realDataAttached', 'handoffDigest', 'runtimeVersion', 'targetSandboxVersion', 'handoffVersion',
]);

/** Resource-limit dimensions the future bridge will bound (planned values, not executed). */
export const BRIDGE_RESOURCE_LIMIT_DIMENSIONS = Object.freeze([
  'maxSourcePayloadBytes', 'maxSourceFields', 'maxSourceLayoutSections', 'maxSourceRelationships',
  'maxValidationIssues', 'maxExtensions', 'maxStringLength',
]);

/** Planned (not executed) default resource limits for the future bridge. */
export const DEFAULT_BRIDGE_RESOURCE_LIMITS = Object.freeze({
  maxSourcePayloadBytes: 262144,
  maxSourceFields: 200,
  maxSourceLayoutSections: 64,
  maxSourceRelationships: 128,
  maxValidationIssues: 512,
  maxExtensions: 32,
  maxStringLength: 4096,
});

/** Old Studio prototype paths that must NEVER be relinked/imported. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Readiness classifications the plan can emit. */
export const BRIDGE_IMPLEMENTATION_PLAN_READINESS_STATES = Object.freeze([
  'studio_authoring_runtime_to_preview_bridge_implementation_plan_ready',
  'ready_for_bridge_implementation_enterprise_checkpoint',
  'needs_bridge_contract_fix', 'needs_authoring_runtime_fix', 'needs_preview_sandbox_contract_fix',
  'blocked', 'invalid',
]);

export const MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN_FLAG = 'MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN';
export const MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PHASES_FLAG = 'MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PHASES';
export const MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_VERIFY_FLAG = 'MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_VERIFY';

/**
 * Immutable capability flags. Every `*PlanOnly`/PLAN capability is TRUE; every real bridge / adapter /
 * source-validation / target-payload / preview-mount / UI / editor / persistence / backend / production /
 * real-data / module-generation / certification / product-exposure / permission-tenancy capability is FALSE.
 */
export const BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  planOnly: true,
  syntheticOnly: true,
  devOnly: true,
  deterministic: true,
  failClosed: true,
  ssotPreserved: true,
  implementationPhasesOnly: true,
  sourceValidationPlanOnly: true,
  draftIdentityEnforcementPlanOnly: true,
  sourceVersionValidationPlanOnly: true,
  sourceDigestValidationPlanOnly: true,
  sourceBoundaryValidationPlanOnly: true,
  mappingExecutionPlanOnly: true,
  targetDescriptorPlanOnly: true,
  targetVersionValidationPlanOnly: true,
  canonicalizationValidationPlanOnly: true,
  extensibilityEnforcementPlanOnly: true,
  validationPipelinePlanOnly: true,
  replayIdempotencyPlanOnly: true,
  resourceLimitsPlanOnly: true,
  failureContainmentPlanOnly: true,
  rolloutRollbackPlanOnly: true,
  observabilityDiagnosticsPlanOnly: true,
  governanceRegistryPlanOnly: true,
  bridgeImplemented: false,
  adapterImplemented: false,
  sourceValidationImplemented: false,
  draftIdentityEnforcementImplemented: false,
  sourceVersionValidationImplemented: false,
  sourceDigestValidationImplemented: false,
  sourceBoundaryValidationImplemented: false,
  mappingExecutorImplemented: false,
  targetDescriptorBuilderImplemented: false,
  targetVersionValidationImplemented: false,
  canonicalizationValidationImplemented: false,
  extensibilityEnforcementImplemented: false,
  validationPipelineImplemented: false,
  replayIdempotencyImplemented: false,
  resourceLimitsImplemented: false,
  failureContainmentImplemented: false,
  targetPayloadCreated: false,
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

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function bridgePlanDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioAuthoringRuntimeToPreviewBridgeImplementationPlanEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PLAN_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioAuthoringRuntimeToPreviewBridgeImplementationPhasesEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_PHASES_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioAuthoringRuntimeToPreviewBridgeImplementationVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_AUTHORING_RUNTIME_TO_PREVIEW_BRIDGE_IMPLEMENTATION_VERIFY_FLAG);
}

export default {
  BRIDGE_IMPLEMENTATION_PLAN_VERSION,
  BRIDGE_IMPLEMENTATION_PLAN_CAPABILITIES,
};
