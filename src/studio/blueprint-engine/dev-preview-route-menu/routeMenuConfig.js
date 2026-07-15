/**
 * Config + flags for the STUDIO DEV PREVIEW ROUTE/MENU (isolated dev-only runtime).
 *
 * This is the first REAL, ISOLATED route/menu runtime of the Studio dev preview. It provides local
 * route resolution, an isolated menu, and guarded Runtime UI mounting THROUGH EXPLICIT DEPENDENCY
 * INJECTION, inside a host that lives OUTSIDE the main App. It is DEV-ONLY, ISOLATED, DEFAULT-OFF,
 * FAIL-CLOSED and synthetic-data-only. Real React/JSX exists ONLY inside
 * `src/studio/blueprint-engine/dev-preview-route-menu/`. It NEVER touches `App.jsx`, the product
 * router / menu / sidebar, `productionUiGuard`, modules, backend, Prisma, migration, network,
 * production, staging, real data, or Empresas; it NEVER registers a browser route, a public URL, or
 * a global deep link; it NEVER uses `react-router`, `BrowserRouter`, `createBrowserRouter`,
 * `useNavigate`, `NavLink`, `window`, `document`, `history`, `location`, `ReactDOM` or an internal
 * `createRoot`; and it NEVER imports or relinks the old Studio prototype. Nothing mounts on import;
 * nothing runs automatically; default is closed/disabled.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. This config file is pure `.js` (automatic JSX runtime elsewhere; no React import).
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const ROUTE_MENU_NAME = 'studio-dev-preview-route-menu';
export const ROUTE_MENU_SEMVER = '1.0.0';
export const ROUTE_MENU_VERSION = 'studio-dev-preview-route-menu@1.0.0';
export const ROUTE_MENU_MODE = 'dev_only_isolated_route_menu_runtime';
export const ROUTE_MENU_ENVIRONMENT = 'local_dev_only';

/** Upstream references (consumed read-only). */
export const ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-route-menu-implementation-plan@1.0.0';
export const ROUTE_MENU_CONTRACT_VERSION = 'studio-dev-preview-route-menu-contract@1.0.0';
export const RUNTIME_UI_VERSION = 'studio-dev-preview-runtime-ui@1.0.0';
export const RUNTIME_UI_CONTRACT_VERSION = 'studio-dev-preview-runtime-ui-contract@1.0.0';
export const ISOLATED_RUNTIME_VERSION = 'studio-dev-preview-isolated-runtime@1.0.0';
export const RUNTIME_SHELL_CONTRACT_VERSION = 'studio-dev-preview-runtime-shell-contract@1.0.0';
export const VISUAL_CONTRACT_VERSION = 'studio-dev-preview-visual-contract@1.0.0';
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** The manual checkpoint receipt value a valid dev-only run requires. */
export const REQUIRED_CHECKPOINT_RECEIPT = 'approved_for_isolated_route_menu_runtime';

/** The isolated host paths (internal to the resolver — NEVER registered in the product router). */
export const ISOLATED_ROUTE_PATHS = Object.freeze([
  '/__dev/studio/preview',
  '/__dev/studio/preview/not-found',
]);

/** The isolated React component names (local subtree only). */
export const ROUTE_MENU_COMPONENT_NAMES = Object.freeze([
  'StudioDevPreviewRouteMenuHost', 'StudioDevPreviewMenu', 'StudioDevPreviewRouteView',
  'StudioDevPreviewNotFound', 'StudioDevPreviewBlocked',
]);

/** Navigation actions permanently blocked (metadata + no-op safe). */
export const BLOCKED_NAVIGATION_KINDS = Object.freeze([
  'navigateProduct', 'registerProductRoute', 'registerProductMenu', 'registerSidebarItem',
  'openPublicDeepLink', 'registerModule', 'readRealData', 'writeRealData',
]);

/** Old Studio prototype paths that must NEVER be imported/relinked. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Readiness classifications the runtime can emit. */
export const ROUTE_MENU_READINESS_STATES = Object.freeze([
  'studio_dev_preview_isolated_route_menu_runtime_ready',
  'ready_for_future_app_integration_contract_after_enterprise_checkpoint',
  'needs_route_menu_contract_fix', 'needs_runtime_ui_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU';
export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_MOUNT_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_MOUNT';
export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. This slice IMPLEMENTS the isolated route/menu, so route/menu/
 * resolver/registry/menu-ui/route-view/mount-adapter/mount-capability implemented flags are TRUE —
 * but confined to the isolated host. Every product / App / router / menu / sidebar / browser /
 * public / mount-by-default / backend / production / mutation / real-data / prototype capability is
 * FALSE. Default is OFF.
 */
export const ROUTE_MENU_CAPABILITIES = Object.freeze({
  devOnly: true,
  isolated: true,
  defaultOff: true,
  failClosed: true,
  syntheticDataOnly: true,
  routeImplemented: true,
  menuImplemented: true,
  isolatedRouteResolverImplemented: true,
  isolatedRouteRegistryImplemented: true,
  isolatedMenuRegistryImplemented: true,
  isolatedMenuUiImplemented: true,
  routeViewImplemented: true,
  mountAdapterImplemented: true,
  runtimeUiMountCapabilityImplemented: true,
  runtimeUiMountedByDefault: false,
  globalRuntimeUiMounted: false,
  browserRouteRegistered: false,
  productRouterWiringImplemented: false,
  productMenuRegistered: false,
  productSidebarRegistered: false,
  appWiringImplemented: false,
  deepLinkImplemented: false,
  publicUrlCreated: false,
  routeCreatedInMainApp: false,
  menuCreatedInMainApp: false,
  featureFlagRequired: true,
  featureFlagDefaultEnabled: false,
  productionDenied: true,
  stagingDenied: true,
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
  realDataRead: false,
  realDataWrite: false,
  rewriteEmpresas: false,
  prototypeRelinked: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function routeMenuDigest(value) {
  return createGenericModelChecksum({ value: value ?? null });
}

/** @param {Record<string, unknown>} env @returns {string} */
export function resolveEnvironmentLabel(env) {
  const e = env && typeof env === 'object' ? env : {};
  if (e.DEV === true || e.DEV === 'true') return 'development';
  const label = String(e.MAK_ENV_LABEL || e.VITE_ENV_LABEL || '').toLowerCase();
  if (label) return label;
  const mode = String(e.MODE || '').toLowerCase();
  if (mode) return mode;
  const nodeEnv = String(e.NODE_ENV || '').toLowerCase();
  if (nodeEnv) return nodeEnv;
  return 'unknown';
}

/** @param {string} environment @returns {boolean} */
export function isDevelopmentEnvironment(environment) {
  return String(environment ?? '').toLowerCase() === 'development';
}

/** @param {string} environment @returns {boolean} */
export function isProductionOrStaging(environment) {
  const e = String(environment ?? '').toLowerCase();
  return e === 'production' || e === 'staging';
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

/** @param {Record<string, unknown>} env @param {string} flag @returns {boolean} */
function flagEnabled(env, flag) {
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG] === 'true';
  if (!requested) return false;
  return isDevelopmentEnvironment(resolveEnvironmentLabel(env)); // dev-only: default-off, fail-closed.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuMountEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_MOUNT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK_FLAG);
}

export default {
  ROUTE_MENU_VERSION,
  ROUTE_MENU_CAPABILITIES,
};
