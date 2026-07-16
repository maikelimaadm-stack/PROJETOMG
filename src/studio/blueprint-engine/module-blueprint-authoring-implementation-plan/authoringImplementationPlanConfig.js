/**
 * Config + flags for the STUDIO MODULE BLUEPRINT AUTHORING IMPLEMENTATION PLAN.
 *
 * Despite the name, this layer is HEADLESS, CONTRACT-ONLY, METADATA-ONLY and PLAN-ONLY: it consumes
 * the Studio Module Blueprint Authoring Foundation Contract (read-only) and produces the deterministic
 * PLAN for a FUTURE headless authoring runtime — implementation phases, draft runtime plan, lifecycle
 * runtime plan, operation executor plan, revision engine plan, validation pipeline plan, invariant
 * enforcement plan, synthetic preview handoff plan, certification-candidate preparation plan, SSOT
 * protection plan, permission/tenancy boundary plan, persistence + module-generation prohibition
 * plans, prototype-relink static-assertion plan, test-harness plan, manual enablement gate plan,
 * rollout/rollback plan, observability/diagnostics plan and governance registry plan.
 *
 * It IMPLEMENTS NO authoring runtime. It creates NO UI, NO editor, NO persistence, NO module, NO
 * App/router/menu/sidebar wiring, NO `.jsx`/`.tsx`/`.css`, NO React component; it never touches
 * `src/App.jsx`, backend/Prisma/migration/network/production/staging, never mutates, never persists,
 * never reads/writes real data, never rewrites Empresas, and NEVER imports or relinks the old Studio
 * prototype. The authoring DRAFT is temporary and non-canonical; the Certified Blueprint Contract
 * remains the canonical SSOT. Default disabled; headless only; fails closed in production; reversible
 * by non-consumption. It authorizes NO authoring runtime implementation slice — only a future,
 * separately-approved slice (after an enterprise checkpoint) may.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const AUTHORING_IMPLEMENTATION_PLAN_NAME = 'studio-module-blueprint-authoring-implementation-plan';
export const AUTHORING_IMPLEMENTATION_PLAN_SEMVER = '1.0.0';
export const AUTHORING_IMPLEMENTATION_PLAN_VERSION = 'studio-module-blueprint-authoring-implementation-plan@1.0.0';
export const AUTHORING_IMPLEMENTATION_PLAN_MODE = 'headless_studio_module_blueprint_authoring_implementation_plan';

/** Upstream references (consumed read-only). */
export const AUTHORING_FOUNDATION_CONTRACT_VERSION = 'studio-module-blueprint-authoring-foundation-contract@1.0.0';
export const BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';
export const BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';

/** The manual checkpoint a future real authoring runtime implementation slice will require. */
export const REQUIRED_FUTURE_CHECKPOINT = 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint';

/** The planned implementation phases (planned metadata only — none implemented). */
export const AUTHORING_IMPLEMENTATION_PHASE_IDS = Object.freeze([
  'phase_0_preflight',
  'phase_1_foundation_contract_validation',
  'phase_2_scope_registry_preparation',
  'phase_3_draft_runtime_model',
  'phase_4_lifecycle_runtime',
  'phase_5_operation_executor',
  'phase_6_revision_engine',
  'phase_7_validation_pipeline',
  'phase_8_invariant_enforcement',
  'phase_9_synthetic_preview_handoff',
  'phase_10_certification_candidate_preparation',
  'phase_11_ssot_protection',
  'phase_12_permission_tenancy_boundary',
  'phase_13_test_harness',
  'phase_14_manual_enablement_gate',
  'phase_15_rollout_blocked',
]);

/** The authorable future operations the executor plan will allow-list (from the foundation contract). */
export const AUTHORING_OPERATION_IDS = Object.freeze([
  'createDraft', 'renameDraft', 'describeDraft', 'addFieldDraft', 'updateFieldDraft', 'removeFieldDraft',
  'reorderFieldDraft', 'addLayoutSectionDraft', 'updateLayoutSectionDraft', 'removeLayoutSectionDraft',
  'addRelationshipDraft', 'removeRelationshipDraft', 'requestValidation', 'requestSyntheticPreviewHandoff',
  'requestCertificationCandidateHandoff', 'discardDraft',
]);

/** Canonical draft lifecycle states the runtime plan will execute. */
export const AUTHORING_LIFECYCLE_STATES = Object.freeze([
  'empty', 'draft', 'validation_pending', 'validation_failed', 'validated', 'preview_ready',
  'handoff_ready', 'discarded',
]);

/** Lifecycle states the runtime must NEVER emit. */
export const FORBIDDEN_LIFECYCLE_STATES = Object.freeze([
  'published', 'production', 'registered', 'generated', 'deployed', 'persisted', 'certified',
]);

/** Validation pipeline stages the plan defines. */
export const VALIDATION_PIPELINE_STAGES = Object.freeze([
  'shape_validation', 'identifier_validation', 'lifecycle_validation', 'field_uniqueness_validation',
  'layout_validation', 'relationship_validation', 'ssot_boundary_validation',
  'permission_tenancy_boundary_validation', 'prototype_reference_validation', 'production_flag_validation',
  'module_generation_validation',
]);

/** Invariants the enforcement plan targets. */
export const AUTHORING_INVARIANT_IDS = Object.freeze([
  'field_keys_unique', 'field_order_non_negative', 'layout_section_ids_unique', 'relationship_ids_unique',
  'relationship_endpoints_known', 'no_production_flags', 'no_persistence_descriptors',
  'no_backend_descriptors', 'no_prisma_descriptors', 'no_real_data_references',
  'no_app_router_menu_descriptors', 'no_old_prototype_references', 'no_self_certification',
  'no_module_generation_authorization',
]);

/** Old Studio prototype paths that must NEVER be relinked/imported. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Readiness classifications the plan can emit. */
export const AUTHORING_IMPLEMENTATION_PLAN_READINESS_STATES = Object.freeze([
  'studio_module_blueprint_authoring_implementation_plan_ready',
  'ready_for_future_authoring_runtime_implementation_slice_after_enterprise_checkpoint',
  'needs_authoring_foundation_contract_fix', 'needs_blueprint_engine_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG = 'MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN';
export const MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PHASES_FLAG = 'MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PHASES';
export const MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_VERIFY_FLAG = 'MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_VERIFY';
export const MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. Every `*PlanOnly`/PLAN capability is TRUE; every real authoring runtime /
 * draft-runtime / executor / persistence / module-generation / UI / editor / backend / production /
 * mutation / real-data / prototype / permission-tenancy-integration capability is FALSE. Default is
 * plan-only. The draft is NON-CANONICAL; the certified blueprint remains SSOT.
 */
export const AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  planOnly: true,
  syntheticOnly: true,
  devOnly: true,
  ssotPreserved: true,
  implementationPhasesOnly: true,
  draftRuntimePlanOnly: true,
  lifecycleRuntimePlanOnly: true,
  operationExecutorPlanOnly: true,
  revisionPlanOnly: true,
  validationPipelinePlanOnly: true,
  invariantEnforcementPlanOnly: true,
  previewHandoffPlanOnly: true,
  certificationCandidatePlanOnly: true,
  ssotProtectionPlanOnly: true,
  permissionTenancyBoundaryPlanOnly: true,
  persistenceProhibitionPlanOnly: true,
  moduleGenerationProhibitionPlanOnly: true,
  prototypeRelinkAssertionPlanOnly: true,
  testHarnessPlanOnly: true,
  manualEnablementGatePlanOnly: true,
  rolloutRollbackPlanOnly: true,
  observabilityDiagnosticsPlanOnly: true,
  governanceRegistryPlanOnly: true,
  authoringRuntimeImplemented: false,
  draftRuntimeImplemented: false,
  lifecycleRuntimeImplemented: false,
  operationExecutorImplemented: false,
  revisionEngineImplemented: false,
  validationPipelineImplemented: false,
  invariantEnforcementImplemented: false,
  previewHandoffImplemented: false,
  certificationCandidateCreated: false,
  certificationPerformed: false,
  authoringUiImplemented: false,
  editorImplemented: false,
  persistenceImplemented: false,
  moduleGenerated: false,
  filesWrittenToModule: false,
  moduleRegistered: false,
  backendAccessed: false,
  prismaAccessed: false,
  productionAccessed: false,
  stagingAccessed: false,
  fetchUsed: false,
  mutationAllowed: false,
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
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function authoringPlanDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleBlueprintAuthoringImplementationPlanEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PLAN_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleBlueprintAuthoringImplementationPhasesEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_PHASES_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleBlueprintAuthoringImplementationVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleBlueprintAuthoringImplementationCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG);
}

export default {
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES,
};
