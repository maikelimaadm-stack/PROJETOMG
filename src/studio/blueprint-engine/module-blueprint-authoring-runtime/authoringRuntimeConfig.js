/**
 * Config + constants for the STUDIO MODULE BLUEPRINT AUTHORING RUNTIME.
 *
 * This layer is HEADLESS, DEV-ONLY, SYNTHETIC-ONLY, IN-MEMORY, EPHEMERAL, DETERMINISTIC,
 * IMMUTABLE-BY-CONTRACT, FAIL-CLOSED and SIDE-EFFECT-FREE. It is the isolated authoring runtime
 * authorized by the Fable 5 enterprise checkpoint (decision
 * `READY_FOR_MODULE_BLUEPRINT_AUTHORING_RUNTIME_SLICE`). It executes, purely in memory on synthetic
 * data, the operations/lifecycle/invariants declared by the Authoring Foundation Contract and planned
 * by the Authoring Implementation Plan.
 *
 * It creates NO UI, NO editor, NO React component, NO `.jsx`/`.tsx`/`.css`, NO App/router/menu/sidebar
 * wiring; it never persists, never writes the filesystem, never touches backend/Prisma/migration/
 * network/production/staging, never mutates real data, never rewrites Empresas, never generates or
 * registers a module, never certifies/self-certifies/overwrites the certified SSOT, and NEVER imports
 * or relinks the old Studio prototype. Determinism is a blocking requirement: NO `Date.now`, NO
 * `new Date`, NO `Math.random`, NO `crypto.randomUUID`/`randomUUID`; every id/digest/session derives
 * only from explicit inputs.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

export const AUTHORING_RUNTIME_NAME = 'studio-module-blueprint-authoring-runtime';
export const AUTHORING_RUNTIME_SEMVER = '1.0.0';
export const AUTHORING_RUNTIME_VERSION = 'studio-module-blueprint-authoring-runtime@1.0.0';
export const AUTHORING_RUNTIME_MODE = 'headless_studio_module_blueprint_authoring_runtime';

/** Upstream references (consumed read-only). */
export const AUTHORING_IMPLEMENTATION_PLAN_VERSION = 'studio-module-blueprint-authoring-implementation-plan@1.0.0';
export const AUTHORING_FOUNDATION_CONTRACT_VERSION = 'studio-module-blueprint-authoring-foundation-contract@1.0.0';
export const BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';
export const BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';

/** The checkpoint that authorized this slice. */
export const SOURCE_CHECKPOINT = 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint';
export const CHECKPOINT_DECISION = 'READY_FOR_MODULE_BLUEPRINT_AUTHORING_RUNTIME_SLICE';

/** Canonical draft lifecycle states. */
export const AUTHORING_LIFECYCLE_STATES = Object.freeze([
  'empty', 'draft', 'validation_pending', 'validation_failed', 'validated', 'preview_ready',
  'handoff_ready', 'discarded',
]);

/** Allowed lifecycle transitions (from -> [to...]). `discarded` is terminal. */
export const AUTHORING_LIFECYCLE_TRANSITIONS = Object.freeze({
  empty: ['draft', 'discarded'],
  draft: ['validation_pending', 'discarded'],
  validation_pending: ['validation_failed', 'validated', 'discarded'],
  validation_failed: ['draft', 'validation_pending', 'discarded'],
  validated: ['preview_ready', 'draft', 'discarded'],
  preview_ready: ['handoff_ready', 'draft', 'discarded'],
  handoff_ready: ['discarded'],
  discarded: [],
});

/** Lifecycle states the runtime must NEVER emit. */
export const FORBIDDEN_LIFECYCLE_STATES = Object.freeze([
  'published', 'production', 'registered', 'generated', 'deployed', 'persisted', 'certified',
]);

/** The allow-listed operations (nothing outside this list executes). */
export const AUTHORING_OPERATION_IDS = Object.freeze([
  'createDraft', 'renameDraft', 'describeDraft', 'addFieldDraft', 'updateFieldDraft', 'removeFieldDraft',
  'reorderFieldDraft', 'addLayoutSectionDraft', 'updateLayoutSectionDraft', 'removeLayoutSectionDraft',
  'addRelationshipDraft', 'removeRelationshipDraft', 'requestValidation', 'requestSyntheticPreviewHandoff',
  'requestCertificationCandidateHandoff', 'discardDraft',
]);

/** Operations that produce a new revision when they succeed. */
export const REVISION_PRODUCING_OPERATIONS = Object.freeze([
  'createDraft', 'renameDraft', 'describeDraft', 'addFieldDraft', 'updateFieldDraft', 'removeFieldDraft',
  'reorderFieldDraft', 'addLayoutSectionDraft', 'updateLayoutSectionDraft', 'removeLayoutSectionDraft',
  'addRelationshipDraft', 'removeRelationshipDraft',
]);

/** Validation pipeline stages, in fixed deterministic order. */
export const VALIDATION_PIPELINE_STAGES = Object.freeze([
  'shape_validation', 'identifier_validation', 'lifecycle_validation', 'field_uniqueness_validation',
  'layout_validation', 'relationship_validation', 'ssot_boundary_validation',
  'permission_tenancy_boundary_validation', 'prototype_reference_validation', 'production_flag_validation',
  'module_generation_validation',
]);

/** Structural invariants enforced. */
export const AUTHORING_INVARIANT_IDS = Object.freeze([
  'field_keys_unique', 'field_order_non_negative', 'layout_section_ids_unique', 'relationship_ids_unique',
  'relationship_endpoints_known', 'no_production_flags', 'no_persistence_descriptors',
  'no_backend_descriptors', 'no_prisma_descriptors', 'no_real_data_references',
  'no_app_router_menu_descriptors', 'no_old_prototype_references', 'no_self_certification',
  'no_module_generation_authorization',
]);

/** Issue severities (ascending order used for stable sort). */
export const AUTHORING_ISSUE_SEVERITIES = Object.freeze(['info', 'warning', 'error', 'blocker']);

/** Field data kinds. */
export const AUTHORING_FIELD_KINDS = Object.freeze([
  'text', 'number', 'boolean', 'date', 'select', 'reference', 'unknown',
]);

/** Relationship cardinalities. */
export const AUTHORING_RELATIONSHIP_CARDINALITIES = Object.freeze([
  'one_to_one', 'one_to_many', 'many_to_one', 'many_to_many', 'unknown',
]);

/** Old Studio prototype paths that must NEVER be relinked/imported. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Conservative default resource limits (all fail-closed on excess). */
export const DEFAULT_AUTHORING_RESOURCE_LIMITS = Object.freeze({
  maxDraftsPerSession: 8,
  maxOperationsPerSession: 500,
  maxRevisionsPerDraft: 200,
  maxFieldsPerDraft: 250,
  maxLayoutSectionsPerDraft: 100,
  maxRelationshipsPerDraft: 250,
  maxValidationIssuesPerRun: 1000,
  maxStringLength: 10000,
  maxSerializedSnapshotBytes: 2000000,
});

/** Readiness classifications the runtime can emit. */
export const AUTHORING_RUNTIME_READINESS_STATES = Object.freeze([
  'studio_module_blueprint_authoring_runtime_ready',
  'authoring_runtime_ready_for_headless_synthetic_validation_only',
  'needs_authoring_foundation_contract_fix', 'needs_authoring_implementation_plan_fix', 'blocked', 'invalid',
]);

/**
 * Immutable capability flags. The runtime IS implemented (headless/synthetic/in-memory), but every
 * UI/editor/persistence/filesystem/module/backend/production/real-data/certification/permission-tenancy
 * capability is FALSE. The draft is NON-CANONICAL; the certified blueprint remains SSOT.
 */
export const AUTHORING_RUNTIME_CAPABILITIES = Object.freeze({
  headless: true,
  devOnly: true,
  syntheticOnly: true,
  inMemoryOnly: true,
  ephemeralOnly: true,
  deterministic: true,
  immutableSnapshots: true,
  failClosed: true,
  sideEffectFree: true,
  ssotPreserved: true,
  authoringRuntimeImplemented: true,
  draftRuntimeImplemented: true,
  lifecycleRuntimeImplemented: true,
  operationExecutorImplemented: true,
  revisionEngineImplemented: true,
  validationPipelineImplemented: true,
  invariantEnforcementImplemented: true,
  previewHandoffImplemented: true,
  certificationCandidatePreparationImplemented: true,
  certificationPerformed: false,
  authoringUiImplemented: false,
  editorImplemented: false,
  persistenceImplemented: false,
  storageUsed: false,
  filesystemWritesUsed: false,
  moduleGenerated: false,
  filesWrittenToModule: false,
  moduleRegistered: false,
  backendAccessed: false,
  prismaAccessed: false,
  productionAccessed: false,
  stagingAccessed: false,
  fetchUsed: false,
  networkUsed: false,
  mutationExternalAllowed: false,
  realDataRead: false,
  realDataWrite: false,
  rewriteEmpresas: false,
  prototypeRelinked: false,
  productExposed: false,
  menuCreated: false,
  routeCreated: false,
  permissionModelIntegrated: false,
  tenantModelIntegrated: false,
  serverSideAuthorizationIntegrated: false,
  draftIsCanonical: false,
  candidateIsCanonical: false,
});

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

export const MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG = 'MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME';
export const MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_VERIFY_FLAG = 'MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_VERIFY';

/** @param {Record<string, unknown>} env @param {string} flag @returns {boolean} */
function flagEnabled(env, flag) {
  const requested = env[flag] === 'true' || env[MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleBlueprintAuthoringRuntimeEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleBlueprintAuthoringRuntimeVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_RUNTIME_VERIFY_FLAG);
}

export default {
  AUTHORING_RUNTIME_VERSION,
  AUTHORING_RUNTIME_CAPABILITIES,
};
