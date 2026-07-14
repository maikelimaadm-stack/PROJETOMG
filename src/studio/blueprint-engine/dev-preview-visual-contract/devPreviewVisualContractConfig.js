/**
 * Config + headless flags for the STUDIO DEV PREVIEW VISUAL CONTRACT.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it consumes the Dev Preview Contract Bridge and
 * produces deterministic VISUAL tree / screen / component-placeholder / state / interaction /
 * theme-token / accessibility CONTRACTS. It renders NO UI, creates NO React component, NO
 * `.jsx`/`.tsx`, NO DOM, NO runtime CSS, NO route/menu, NO module, writes NO file under
 * `src/modules`, and never touches backend/Prisma/migration/network/production/staging, never
 * mutates, never persists, never rewrites Empresas. Default disabled; headless only; nothing
 * is auto-consumed by the app; reversible by non-consumption.
 *
 * Lives under `src/studio/` → browser eslint globals → uses `globalThis.process`, never a
 * bare `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const VISUAL_CONTRACT_NAME = 'studio-dev-preview-visual-contract';
export const VISUAL_CONTRACT_SEMVER = '1.0.0';
export const VISUAL_CONTRACT_VERSION = 'studio-dev-preview-visual-contract@1.0.0';
export const VISUAL_CONTRACT_MODE = 'headless_dev_preview_visual_contract';
export const VISUAL_CONTRACT_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/**
 * Visual placeholder KINDS the contract may reference (never real components). Each is a
 * plain contract token — importing or rendering any real component is forbidden.
 */
export const ALLOWED_VISUAL_PLACEHOLDER_KINDS = Object.freeze([
  'VisualContainerPlaceholder', 'VisualSectionPlaceholder', 'VisualTablePlaceholder',
  'VisualFormPlaceholder', 'VisualDetailPlaceholder', 'VisualFieldPlaceholder',
  'VisualLabelPlaceholder', 'VisualInputPlaceholder', 'VisualSelectPlaceholder',
  'VisualDatePlaceholder', 'VisualNumberPlaceholder', 'VisualTextPlaceholder',
  'VisualBooleanPlaceholder', 'VisualBadgePlaceholder', 'VisualButtonPlaceholder',
  'VisualEmptyStatePlaceholder', 'VisualBlockedStatePlaceholder', 'VisualLoadingStatePlaceholder',
  'VisualErrorStatePlaceholder',
]);

/** Placeholder kinds explicitly blocked (would imply a real component / runtime). */
export const BLOCKED_VISUAL_PLACEHOLDER_KINDS = Object.freeze([
  'ReactComponent', 'JsxElement', 'TsxElement', 'DomNode', 'RealInput', 'LiveDataGrid',
  'RouterOutlet', 'RouteLink', 'MenuItem', 'NavBar', 'Iframe', 'ScriptTag', 'StylesheetLink',
  'FetchWidget', 'MutationButton',
]);

/** Visual state kinds the contract can describe (metadata-only; no real runtime state). */
export const VISUAL_STATE_KINDS = Object.freeze([
  'idle', 'loading', 'empty', 'ready', 'blocked', 'error', 'validationError', 'permissionDenied',
]);

/** Interaction kinds — metadata-only; the blocked* ones are permanently disabled. */
export const VISUAL_INTERACTION_KINDS = Object.freeze([
  'read', 'openDetail', 'filter', 'sort', 'paginate', 'cancel',
  'blockedCreate', 'blockedUpdate', 'blockedDelete', 'blockedSubmit',
]);

/** Theme token groups — contractual only; no real CSS/Tailwind/stylesheet. */
export const VISUAL_THEME_TOKEN_GROUPS = Object.freeze([
  'density', 'spacing', 'radius', 'surface', 'text', 'border', 'semanticStatus',
]);

/** Readiness classifications the visual contract can emit. */
export const VISUAL_CONTRACT_READINESS_STATES = Object.freeze([
  'studio_dev_preview_visual_contract_ready', 'ready_for_future_dev_preview_visual_runtime_contract',
  'needs_bridge_fix', 'needs_sandbox_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG = 'MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT';
export const MAK_STUDIO_DEV_PREVIEW_VISUAL_TREE_FLAG = 'MAK_STUDIO_DEV_PREVIEW_VISUAL_TREE';
export const MAK_STUDIO_DEV_PREVIEW_VISUAL_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_VISUAL_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_VISUAL_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_VISUAL_COMPATIBILITY_CHECK';

/**
 * Immutable headless capability flags. The `*Only` capabilities are TRUE (contract-only
 * capabilities); every real UI / DOM / CSS / side-effect / production capability is FALSE.
 */
export const VISUAL_CONTRACT_HEADLESS_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  visualTreeOnly: true,
  visualScreenOnly: true,
  componentPlaceholderOnly: true,
  stateContractOnly: true,
  interactionMetadataOnly: true,
  themeTokenMetadataOnly: true,
  routePlanMetadataOnly: true,
  menuPlanMetadataOnly: true,
  reactComponentCreated: false,
  jsxCreated: false,
  tsxCreated: false,
  domCreated: false,
  cssCreated: false,
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
export function visualDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewVisualContractEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_VISUAL_CONTRACT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewVisualTreeEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_VISUAL_TREE_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewVisualVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_VISUAL_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewVisualCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_VISUAL_COMPATIBILITY_CHECK_FLAG);
}

export default {
  VISUAL_CONTRACT_VERSION,
  VISUAL_CONTRACT_HEADLESS_CAPABILITIES,
};
