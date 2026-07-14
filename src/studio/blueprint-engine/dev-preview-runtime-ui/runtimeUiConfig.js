/**
 * Config + flags for the STUDIO DEV PREVIEW RUNTIME UI.
 *
 * This is the first REAL, ISOLATED UI runtime of the Studio dev preview. It renders synthetic
 * virtual preview frames into a CONFINED React/JSX subtree local to this slice. It is DEV-ONLY,
 * ISOLATED, synthetic-data-only and FAIL-CLOSED. Real React/JSX exists ONLY inside
 * `src/studio/blueprint-engine/dev-preview-runtime-ui/`. It NEVER wires App / routes / menu /
 * modules, never mounts to the real DOM (no ReactDOM / createRoot / window / document), never
 * touches backend / Prisma / migration / network / production / staging, never mutates, never
 * persists, never reads/writes real data, never rewrites Empresas, and NEVER imports or relinks
 * the old Studio prototype. Nothing is auto-consumed by the app; reversible by non-consumption.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. This config file is pure `.js` (no React import).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const RUNTIME_UI_NAME = 'studio-dev-preview-runtime-ui';
export const RUNTIME_UI_SEMVER = '1.0.0';
export const RUNTIME_UI_VERSION = 'studio-dev-preview-runtime-ui@1.0.0';
export const RUNTIME_UI_MODE = 'dev_only_isolated_runtime_ui';
export const RUNTIME_UI_ENVIRONMENT = 'local_dev_only';

/** Upstream references (consumed read-only). */
export const RUNTIME_UI_CONTRACT_VERSION = 'studio-dev-preview-runtime-ui-contract@1.0.0';
export const ISOLATED_RUNTIME_VERSION = 'studio-dev-preview-isolated-runtime@1.0.0';
export const IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-runtime-ui-implementation-plan@1.0.0';
export const RUNTIME_SHELL_CONTRACT_VERSION = 'studio-dev-preview-runtime-shell-contract@1.0.0';
export const VISUAL_CONTRACT_VERSION = 'studio-dev-preview-visual-contract@1.0.0';
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** The isolated React component names this UI runtime may render (local subtree only). */
export const RUNTIME_UI_COMPONENT_NAMES = Object.freeze([
  'RuntimeUiRoot', 'RuntimeUiScreen', 'RuntimeUiSection', 'RuntimeUiSlot',
  'RuntimeUiPlaceholder', 'RuntimeUiBlockedActionBanner', 'RuntimeUiFallback',
]);

/** Interaction kinds — all blocked (read-only / no-op safe). */
export const RUNTIME_UI_INTERACTION_KINDS = Object.freeze([
  'read', 'openDetail', 'filter', 'sort', 'paginate', 'cancel',
  'blockedCreate', 'blockedUpdate', 'blockedDelete', 'blockedSubmit', 'blockedSave', 'blockedNavigate',
]);

/** Blocked action kinds — permanently blocked. */
export const RUNTIME_UI_BLOCKED_ACTION_KINDS = Object.freeze([
  'create', 'update', 'delete', 'submit', 'save', 'export', 'navigate', 'openRoute',
  'registerModule', 'readRealData', 'writeRealData',
]);

/** Old Studio prototype paths that must NEVER be imported/relinked by this subtree. */
export const FORBIDDEN_PROTOTYPE_IMPORT_PREFIXES = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
  'src/components/', 'src/pages/',
]);

/** Readiness classifications the runtime UI can emit. */
export const RUNTIME_UI_READINESS_STATES = Object.freeze([
  'studio_dev_preview_runtime_ui_ready',
  'ready_for_future_dev_preview_route_menu_contract_when_explicitly_authorized',
  'needs_runtime_ui_contract_fix', 'needs_isolated_runtime_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_RENDER_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_RENDER';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. This slice IMPLEMENTS the isolated UI, so `uiCreated`,
 * `reactComponentCreated`, `jsxCreated`, `runtimeUiImplemented`, `visualRuntimeImplemented` and
 * `reactRuntimeCreated` are TRUE — but confined to the authorized subtree. Every real DOM / CSS /
 * route / menu / module / backend / production / mutation / real-data capability is FALSE, and
 * `domRuntimeCreated` is FALSE (no global mount via document / createRoot / App / router).
 */
export const RUNTIME_UI_CAPABILITIES = Object.freeze({
  headless: false,
  devOnly: true,
  isolated: true,
  contractDriven: true,
  syntheticDataOnly: true,
  virtualFrameDriven: true,
  blockedActionsOnly: true,
  reactComponentCreated: true,
  jsxCreated: true,
  uiCreated: true,
  runtimeUiImplemented: true,
  visualRuntimeImplemented: true,
  reactRuntimeCreated: true,
  tsxCreated: false,
  domCreated: false,
  cssCreated: false,
  routeCreated: false,
  menuCreated: false,
  moduleGenerated: false,
  filesWrittenToModule: false,
  moduleRegistered: false,
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
  oldPrototypeImported: false,
  appWired: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function runtimeUiDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // dev-only: fails closed in production/staging, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRuntimeUiRenderEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_RUNTIME_UI_RENDER_FLAG);
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
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CAPABILITIES,
};
