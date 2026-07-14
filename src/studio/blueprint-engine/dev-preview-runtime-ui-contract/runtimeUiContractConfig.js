/**
 * Config + flags for the STUDIO DEV PREVIEW RUNTIME UI CONTRACT.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it consumes the Dev Preview Isolated Runtime's
 * virtual preview frame and produces the deterministic CONTRACT of a future UI runtime — UI
 * node / layout / component-binding / interaction-binding / render-boundary / state /
 * accessibility / theme projections and blocked-action metadata. It creates NO React
 * component, NO `.jsx`/`.tsx`/`.css`, NO DOM, NO runtime CSS, NO route/menu, NO module, writes
 * NO file under `src/modules`, and never touches backend/Prisma/migration/network/production/
 * staging, never mutates, never persists, never reads/writes real data, never rewrites
 * Empresas. Default disabled; headless only; fails closed in production; nothing is
 * auto-consumed by the app; reversible by non-consumption. It authorizes NO UI runtime
 * implementation and NO route/menu integration — only a future, separately-approved slice may.
 *
 * Lives under `src/studio/` → browser eslint globals → uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const RUNTIME_UI_CONTRACT_NAME = 'studio-dev-preview-runtime-ui-contract';
export const RUNTIME_UI_CONTRACT_SEMVER = '1.0.0';
export const RUNTIME_UI_CONTRACT_VERSION = 'studio-dev-preview-runtime-ui-contract@1.0.0';
export const RUNTIME_UI_CONTRACT_MODE = 'headless_dev_preview_runtime_ui_contract';
export const RUNTIME_UI_CONTRACT_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const ISOLATED_RUNTIME_VERSION = 'studio-dev-preview-isolated-runtime@1.0.0';
export const IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0';
export const RUNTIME_SHELL_CONTRACT_VERSION = 'studio-dev-preview-runtime-shell-contract@1.0.0';
export const VISUAL_CONTRACT_VERSION = 'studio-dev-preview-visual-contract@1.0.0';
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** UI node kinds the contract may reference as future placeholders (never real components). */
export const UI_NODE_KINDS = Object.freeze([
  'uiRoot', 'uiRegion', 'uiSection', 'uiTable', 'uiForm', 'uiDetail', 'uiField', 'uiLabel',
  'uiInputPlaceholder', 'uiButtonPlaceholder', 'uiEmptyState', 'uiBlockedState',
]);

/** Blocked action kinds — permanently blocked in this contract. */
export const BLOCKED_ACTION_KINDS = Object.freeze([
  'create', 'update', 'delete', 'submit', 'save', 'export', 'navigate', 'openRoute',
  'registerModule',
]);

/** Interaction kinds the contract may describe (all blocked, metadata-only). */
export const INTERACTION_KINDS = Object.freeze([
  'read', 'openDetail', 'filter', 'sort', 'paginate', 'cancel',
  'blockedCreate', 'blockedUpdate', 'blockedDelete', 'blockedSubmit',
]);

/** Readiness classifications the contract can emit. */
export const RUNTIME_UI_CONTRACT_READINESS_STATES = Object.freeze([
  'studio_dev_preview_runtime_ui_contract_ready',
  'ready_for_future_runtime_ui_implementation_slice_when_explicitly_authorized',
  'needs_isolated_runtime_fix', 'needs_implementation_plan_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_NODES_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_NODES';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. The `*Only` capabilities are TRUE (contract-only / projection
 * capabilities); every real UI / DOM / CSS / route / menu / module / backend / production /
 * mutation / real-data capability is FALSE. `visualRuntimeImplemented` is FALSE — no UI runtime.
 */
export const RUNTIME_UI_CONTRACT_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  uiContractOnly: true,
  virtualFrameDriven: true,
  uiNodeMetadataOnly: true,
  layoutMetadataOnly: true,
  componentBindingMetadataOnly: true,
  interactionBindingMetadataOnly: true,
  renderBoundaryMetadataOnly: true,
  stateProjectionMetadataOnly: true,
  accessibilityProjectionMetadataOnly: true,
  themeProjectionMetadataOnly: true,
  blockedActionMetadataOnly: true,
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
  visualRuntimeImplemented: false,
  reactRuntimeCreated: false,
  domRuntimeCreated: false,
  cssRuntimeCreated: false,
  routeRuntimeCreated: false,
  menuRuntimeCreated: false,
  moduleRuntimeCreated: false,
  backendAccessed: false,
  prismaAccessed: false,
  productionAccessed: false,
  stagingAccessed: false,
  fetchUsed: false,
  mutationAllowed: false,
  persistenceCreated: false,
  realDataRead: false,
  realDataWrite: false,
  rewriteEmpresas: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function uiContractDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiContractEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_CONTRACT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiNodesEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_NODES_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK_FLAG);
}

export default {
  RUNTIME_UI_CONTRACT_VERSION,
  RUNTIME_UI_CONTRACT_CAPABILITIES,
};
