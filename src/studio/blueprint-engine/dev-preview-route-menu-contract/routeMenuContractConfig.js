/**
 * Config + flags for the STUDIO DEV PREVIEW ROUTE/MENU CONTRACT.
 *
 * This layer is HEADLESS and CONTRACT-ONLY: it consumes the Dev Preview Runtime UI and produces
 * the deterministic CONTRACT for a future, controlled route/menu integration — route descriptor,
 * eligibility, guard, isolation, visibility, access decision, menu placement/visibility/
 * eligibility, navigation boundary, deep-link blocked, App/router/menu wiring blocked, manual
 * enablement gate, rollout/rollback and safety. It creates NO real route, NO real menu, NO
 * router, NO App/router/navigation/sidebar/shell wiring, NO `Route`/`Routes`/`NavLink`/`Link`/
 * `BrowserRouter`/`createBrowserRouter`/`useNavigate`, NO deep link, NO module, writes NO file
 * under `src/modules`, and never touches backend/Prisma/migration/network/production/staging,
 * never mutates, never persists, never reads/writes real data, never rewrites Empresas, and NEVER
 * imports or relinks the old Studio prototype. Default disabled; headless only; fails closed in
 * production; nothing is auto-consumed by the app; reversible by non-consumption. It authorizes
 * NO route/menu implementation and NO App integration — only a future, separately-approved slice
 * (after an enterprise checkpoint) may.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const ROUTE_MENU_CONTRACT_NAME = 'studio-dev-preview-route-menu-contract';
export const ROUTE_MENU_CONTRACT_SEMVER = '1.0.0';
export const ROUTE_MENU_CONTRACT_VERSION = 'studio-dev-preview-route-menu-contract@1.0.0';
export const ROUTE_MENU_CONTRACT_MODE = 'headless_dev_preview_route_menu_contract';
export const ROUTE_MENU_CONTRACT_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const RUNTIME_UI_VERSION = 'studio-dev-preview-runtime-ui@1.0.0';
export const RUNTIME_UI_CONTRACT_VERSION = 'studio-dev-preview-runtime-ui-contract@1.0.0';
export const ISOLATED_RUNTIME_VERSION = 'studio-dev-preview-isolated-runtime@1.0.0';
export const RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-runtime-ui-implementation-plan@1.0.0';
export const RUNTIME_SHELL_CONTRACT_VERSION = 'studio-dev-preview-runtime-shell-contract@1.0.0';
export const VISUAL_CONTRACT_VERSION = 'studio-dev-preview-visual-contract@1.0.0';
export const DEV_PREVIEW_BRIDGE_VERSION = 'studio-dev-preview-contract-bridge@1.0.0';
export const MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION = 'studio-module-preview-sandbox-contract@1.0.0';
export const MODULE_REFERENCE_PLANNER_VERSION = 'studio-blueprint-module-reference-planner@1.0.0';
export const STUDIO_BLUEPRINT_ENGINE_VERSION = 'studio-blueprint-engine@1.0.0';
export const STUDIO_BLUEPRINT_CONTRACT_VERSION = 'studio-blueprint-contract@1.0.0';

/** Navigation actions the contract permanently blocks (enforcement plan, metadata only). */
export const BLOCKED_NAVIGATION_KINDS = Object.freeze([
  'navigate', 'openRoute', 'deepLink', 'registerRoute', 'registerMenu', 'registerSidebarItem',
  'registerModule',
]);

/** Readiness classifications the contract can emit. */
export const ROUTE_MENU_CONTRACT_READINESS_STATES = Object.freeze([
  'studio_dev_preview_route_menu_contract_ready',
  'ready_for_future_route_menu_implementation_plan_after_enterprise_checkpoint',
  'needs_runtime_ui_fix', 'needs_runtime_ui_contract_fix', 'blocked', 'invalid',
]);

/** The manual checkpoint a future real route/menu implementation slice will require. */
export const REQUIRED_FUTURE_CHECKPOINT = 'pre_route_menu_implementation_enterprise_checkpoint';

export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT';
export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_DESCRIPTOR_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_DESCRIPTOR';
export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. Every `*Only` contract capability is TRUE; every real route / menu /
 * wiring / link / module / backend / production / mutation / real-data capability is FALSE.
 */
export const ROUTE_MENU_CONTRACT_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  routeContractOnly: true,
  menuContractOnly: true,
  navigationContractOnly: true,
  devOnly: true,
  isolated: true,
  routeDescriptorMetadataOnly: true,
  routeEligibilityMetadataOnly: true,
  routeGuardMetadataOnly: true,
  routeIsolationMetadataOnly: true,
  routeVisibilityMetadataOnly: true,
  menuPlacementMetadataOnly: true,
  menuVisibilityMetadataOnly: true,
  navigationBoundaryMetadataOnly: true,
  deepLinkBlockedMetadataOnly: true,
  manualEnablementGateOnly: true,
  routeCreated: false,
  menuCreated: false,
  appWiringCreated: false,
  routerWiringCreated: false,
  navigationWiringCreated: false,
  sidebarWiringCreated: false,
  deepLinkCreated: false,
  linkCreated: false,
  navLinkCreated: false,
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
  oldPrototypeImported: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function routeMenuDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuContractEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuDescriptorEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_DESCRIPTOR_FLAG);
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
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_CONTRACT_CAPABILITIES,
};
