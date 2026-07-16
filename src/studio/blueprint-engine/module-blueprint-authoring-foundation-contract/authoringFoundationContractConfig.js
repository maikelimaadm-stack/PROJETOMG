/**
 * Config + flags for the STUDIO MODULE BLUEPRINT AUTHORING FOUNDATION CONTRACT.
 *
 * This layer is HEADLESS, CONTRACT-ONLY and METADATA-ONLY. It establishes the contractual foundation
 * for FUTURE Module Blueprint authoring — deterministic authoring sessions, non-canonical drafts,
 * field/layout/relationship draft descriptors, validation issues, lifecycle states, an authorizable
 * operation catalog, structural invariants, preview + certification-candidate handoffs, SSOT and
 * permission/tenancy boundaries, prototype-relink prohibition and a manual enablement gate.
 *
 * SSOT: the authoring DRAFT is a TEMPORARY, NON-CANONICAL structure. The Certified Blueprint Contract
 * remains the canonical SSOT; the Blueprint Engine and Module Reference Planner are read-only
 * consumers; the Preview Sandbox is the synthetic handoff destination. A draft may, in a future and
 * separately-approved slice, produce a `certificationCandidate` — it can NEVER self-certify,
 * overwrite the certified contract, register a module, generate files, or publish to the product.
 *
 * It IMPLEMENTS NO authoring runtime, NO UI, NO editor, NO module, NO persistence. It creates NO
 * App/router/menu/sidebar wiring, NO `.jsx`/`.tsx`/`.css`, NO React component, and never touches
 * backend/Prisma/migration/network/production/staging, never mutates, never persists, never
 * reads/writes real data, never rewrites Empresas, and NEVER imports or relinks the old Studio
 * prototype. Default is contract-only; fails closed; reversible by non-consumption.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const AUTHORING_FOUNDATION_CONTRACT_NAME = 'studio-module-blueprint-authoring-foundation-contract';
export const AUTHORING_FOUNDATION_CONTRACT_SEMVER = '1.0.0';
export const AUTHORING_FOUNDATION_CONTRACT_VERSION = 'studio-module-blueprint-authoring-foundation-contract@1.0.0';
export const AUTHORING_FOUNDATION_CONTRACT_MODE = 'headless_studio_module_blueprint_authoring_foundation_contract';

/** Upstream references (consumed read-only). */
export const BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';
export const BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';

/** The manual checkpoint a future authoring runtime slice will require. */
export const REQUIRED_FUTURE_CHECKPOINT = 'pre_module_blueprint_authoring_runtime_enterprise_checkpoint';

/** Canonical draft lifecycle states. */
export const AUTHORING_LIFECYCLE_STATES = Object.freeze([
  'empty', 'draft', 'validation_pending', 'validation_failed', 'validated', 'preview_ready',
  'handoff_ready', 'discarded',
]);

/** Allowed lifecycle transitions (from -> [to...]). */
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

/** Lifecycle states the contract must NEVER emit (they would imply real generation/publication). */
export const FORBIDDEN_LIFECYCLE_STATES = Object.freeze([
  'published', 'production', 'registered', 'generated', 'deployed', 'persisted', 'certified',
]);

/** Validation issue severities. */
export const AUTHORING_ISSUE_SEVERITIES = Object.freeze(['info', 'warning', 'error', 'blocker']);

/** The authorizable future operations (descriptors only — none implemented). */
export const AUTHORING_OPERATION_IDS = Object.freeze([
  'createDraft', 'renameDraft', 'describeDraft', 'addFieldDraft', 'updateFieldDraft', 'removeFieldDraft',
  'reorderFieldDraft', 'addLayoutSectionDraft', 'updateLayoutSectionDraft', 'removeLayoutSectionDraft',
  'addRelationshipDraft', 'removeRelationshipDraft', 'requestValidation', 'requestSyntheticPreviewHandoff',
  'requestCertificationCandidateHandoff', 'discardDraft',
]);

/** Structural invariants the foundation declares. */
export const AUTHORING_INVARIANT_IDS = Object.freeze([
  'draft_id_deterministic', 'field_keys_unique', 'field_order_non_negative', 'layout_section_ids_unique',
  'relationship_ids_unique', 'relationship_endpoints_known', 'no_production_flags', 'no_persistence_descriptors',
  'no_backend_descriptors', 'no_prisma_descriptors', 'no_real_data_references', 'no_app_router_menu_descriptors',
  'no_old_prototype_references', 'no_self_certification', 'no_module_generation_authorization',
]);

/** Old Studio prototype paths that must NEVER be imported/relinked. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Readiness classifications the contract can emit. */
export const AUTHORING_FOUNDATION_READINESS_STATES = Object.freeze([
  'studio_module_blueprint_authoring_foundation_contract_ready',
  'ready_for_future_authoring_implementation_plan_after_explicit_authorization',
  'needs_blueprint_contract_fix', 'needs_blueprint_engine_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG = 'MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION';
export const MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_VERIFY_FLAG = 'MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_VERIFY';
export const MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. Every headless/contract capability is TRUE; every authoring-runtime /
 * UI / editor / persistence / module-generation / backend / production / real-data / product-exposure
 * / prototype capability is FALSE. The draft is NON-CANONICAL; the certified blueprint remains SSOT.
 */
export const AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  syntheticOnly: true,
  devOnly: true,
  ssotPreserved: true,
  draftIsCanonical: false,
  certifiedBlueprintRemainsSsot: true,
  authoringRuntimeImplemented: false,
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
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function authoringFoundationDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleBlueprintAuthoringFoundationEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleBlueprintAuthoringFoundationVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModuleBlueprintAuthoringFoundationCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_BLUEPRINT_AUTHORING_FOUNDATION_COMPATIBILITY_CHECK_FLAG);
}

export default {
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES,
};
