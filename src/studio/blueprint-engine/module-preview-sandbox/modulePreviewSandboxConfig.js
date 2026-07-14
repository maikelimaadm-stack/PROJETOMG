/**
 * Config + headless flags for the STUDIO MODULE PREVIEW SANDBOX CONTRACT.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it consumes the Studio Blueprint Engine and
 * the Module Reference Planner to produce PREVIEW METADATA only (table/form/detail/field/
 * action/permission previews plus route-menu/persistence "blocked" metadata and runtime
 * binding metadata). It renders NO UI, creates NO React component, NO route/menu, NO
 * module, writes NO file under `src/modules`, and never touches backend/Prisma/migration/
 * network/production/staging, never mutates, never persists, never rewrites Empresas.
 * Default disabled; headless only; reversible by non-consumption.
 *
 * Lives under `src/studio/` → browser eslint globals → uses `globalThis.process`, never a
 * bare `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const MODULE_PREVIEW_SANDBOX_CONTRACT_NAME = 'studio-module-preview-sandbox-contract';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_SEMVER = '1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_PREVIEW_SANDBOX_MODE = 'headless_preview_sandbox_contract';
export const MODULE_PREVIEW_SANDBOX_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';
export const EMPRESAS_CERTIFIED_BLUEPRINT_MIRROR_VERSION = 'empresas-certified-blueprint-mirror@1.0.0';

/** The preview kinds this sandbox may emit (metadata only). */
export const ALLOWED_PREVIEW_KINDS = Object.freeze([
  'table_metadata', 'form_metadata', 'detail_metadata', 'field_metadata', 'action_metadata',
  'permission_metadata', 'route_menu_blocked_metadata', 'persistence_blocked_metadata',
  'runtime_binding_metadata',
]);

/** Effects that are prohibited inside the sandbox (never performed). */
export const PROHIBITED_EFFECTS = Object.freeze([
  'react_component_creation', 'ui_creation', 'route_creation', 'menu_creation',
  'module_generation', 'src_modules_write', 'backend_access', 'prisma_access',
  'production_access', 'staging_access', 'fetch', 'mutation', 'persistence_creation',
  'rewrite_empresas',
]);

/** Readiness classifications the sandbox contract can emit. */
export const MODULE_PREVIEW_READINESS_STATES = Object.freeze([
  'module_preview_sandbox_contract_ready', 'ready_for_dev_preview_contract',
  'needs_reference_plan_fix', 'needs_blueprint_fix', 'needs_empresas_alignment',
  'needs_registry', 'blocked', 'invalid',
]);

export const MAK_STUDIO_MODULE_PREVIEW_SANDBOX_CONTRACT_FLAG = 'MAK_STUDIO_MODULE_PREVIEW_SANDBOX_CONTRACT';
export const MAK_STUDIO_MODULE_PREVIEW_METADATA_FLAG = 'MAK_STUDIO_MODULE_PREVIEW_METADATA';
export const MAK_STUDIO_MODULE_PREVIEW_VERIFY_FLAG = 'MAK_STUDIO_MODULE_PREVIEW_VERIFY';
export const MAK_STUDIO_MODULE_PREVIEW_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_MODULE_PREVIEW_COMPATIBILITY_CHECK';

/**
 * Immutable headless capability flags. `headless: true`, `previewMetadataOnly: true`;
 * every side-effecting / UI / generation / production capability is FALSE.
 */
export const MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
  previewMetadataOnly: true,
  reactComponentCreated: false,
  uiCreated: false,
  routeCreated: false,
  menuCreated: false,
  moduleGenerated: false,
  filesWrittenToModule: false,
  moduleRegistered: false,
  backendAccessed: false,
  prismaAccessed: false,
  productionAccessed: false,
  stagingAccessed: false,
  fetchUsed: false,
  mutationAllowed: false,
  persistenceCreated: false,
  rewriteEmpresas: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function sandboxDigest(value) {
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
function isProductionEnv(env) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_MODULE_PREVIEW_SANDBOX_CONTRACT_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModulePreviewSandboxContractEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_PREVIEW_SANDBOX_CONTRACT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModulePreviewMetadataEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_PREVIEW_METADATA_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModulePreviewVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_PREVIEW_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioModulePreviewCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_MODULE_PREVIEW_COMPATIBILITY_CHECK_FLAG);
}

export default {
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_PREVIEW_SANDBOX_HEADLESS_CAPABILITIES,
};
