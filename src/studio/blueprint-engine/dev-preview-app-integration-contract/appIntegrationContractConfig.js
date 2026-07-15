/**
 * Config + flags for the STUDIO DEV PREVIEW APP INTEGRATION CONTRACT.
 *
 * This layer is HEADLESS, CONTRACT-ONLY and METADATA-ONLY. It consumes the Dev Preview Route/Menu
 * runtime and produces the deterministic CONTRACT that describes how the isolated dev-preview host
 * would, in a FUTURE and separately-approved slice, attach to the real App — attachment points,
 * dev-only feature flag metadata, product isolation, App bootstrap boundary, router/menu exposure
 * metadata, Runtime UI mount adapter metadata, dependency injection boundary, lifecycle/cleanup,
 * failure containment, ownership/rollback, production/staging denial, prototype-relink prohibition
 * and a manual enablement gate.
 *
 * It INTEGRATES NOTHING. It creates NO App wiring, NO router wiring, NO menu/sidebar wiring, NO
 * `Route`/`Routes`/`Link`/`NavLink`/`BrowserRouter`/`createBrowserRouter`/`useNavigate`, NO
 * `ReactDOM`/`createRoot`/`window`/`document` mount, NO public deep link, NO module, writes NO file
 * under `src/modules`, never touches `src/App.jsx`, the product router/menu/sidebar, backend/Prisma/
 * migration/network/production/staging, never mutates, never persists, never reads/writes real
 * data, never rewrites Empresas, and NEVER imports or relinks the old Studio prototype. Default
 * disabled; headless only; fails closed in production; nothing is auto-consumed by the app;
 * reversible by non-consumption. It authorizes NO App integration — only a future, separately-
 * approved implementation plan/slice (after an enterprise checkpoint) may.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const APP_INTEGRATION_CONTRACT_NAME = 'studio-dev-preview-app-integration-contract';
export const APP_INTEGRATION_CONTRACT_SEMVER = '1.0.0';
export const APP_INTEGRATION_CONTRACT_VERSION = 'studio-dev-preview-app-integration-contract@1.0.0';
export const APP_INTEGRATION_CONTRACT_MODE = 'headless_dev_preview_app_integration_contract';
export const APP_INTEGRATION_CONTRACT_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const ROUTE_MENU_VERSION = 'studio-dev-preview-route-menu@1.0.0';
export const ROUTE_MENU_CONTRACT_VERSION = 'studio-dev-preview-route-menu-contract@1.0.0';
export const ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-route-menu-implementation-plan@1.0.0';
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

/** The manual checkpoint a future real App integration implementation plan/slice will require. */
export const REQUIRED_FUTURE_CHECKPOINT = 'pre_app_integration_implementation_enterprise_checkpoint';

/** Navigation/integration actions the contract permanently blocks (metadata only). */
export const BLOCKED_INTEGRATION_KINDS = Object.freeze([
  'touchApp', 'wireAppRouter', 'wireProductMenu', 'wireProductSidebar', 'exposeProductRoute',
  'exposeProductMenu', 'mountRuntimeUiInApp', 'connectFeatureFlagToApp', 'createPublicDeepLink',
  'registerModule', 'accessBackend', 'accessPrisma', 'readRealData', 'writeRealData',
]);

/** Old Studio prototype paths that must NEVER be relinked/imported. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Readiness classifications the contract can emit. */
export const APP_INTEGRATION_CONTRACT_READINESS_STATES = Object.freeze([
  'studio_dev_preview_app_integration_contract_ready',
  'ready_for_future_app_integration_implementation_plan_when_explicitly_authorized',
  'needs_route_menu_runtime_fix', 'needs_runtime_ui_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG = 'MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT';
export const MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_ATTACHMENT_FLAG = 'MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_ATTACHMENT';
export const MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. Every `*MetadataOnly`/contract capability is TRUE; every real App /
 * router / menu / sidebar / mount / feature-flag / module / backend / production / mutation /
 * real-data / prototype capability is FALSE. Default is contract-only.
 */
export const APP_INTEGRATION_CONTRACT_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  appIntegrationContractOnly: true,
  devOnly: true,
  isolated: true,
  attachmentPointMetadataOnly: true,
  featureFlagMetadataOnly: true,
  productIsolationMetadataOnly: true,
  bootstrapBoundaryMetadataOnly: true,
  routerAttachmentMetadataOnly: true,
  routeExposureMetadataOnly: true,
  menuExposureMetadataOnly: true,
  runtimeUiMountAdapterMetadataOnly: true,
  dependencyInjectionBoundaryMetadataOnly: true,
  lifecycleCleanupMetadataOnly: true,
  failureContainmentMetadataOnly: true,
  ownershipRollbackMetadataOnly: true,
  productionDenialMetadataOnly: true,
  prototypeRelinkProhibitionMetadataOnly: true,
  manualEnablementGateOnly: true,
  appIntegrated: false,
  appTouched: false,
  appWiringCreated: false,
  routerTouched: false,
  routerWiringCreated: false,
  routeExposedToProduct: false,
  menuExposedToProduct: false,
  sidebarExposedToProduct: false,
  runtimeUiMountedInApp: false,
  featureFlagConnectedToApp: false,
  reactDomUsed: false,
  createRootUsed: false,
  windowUsed: false,
  documentUsed: false,
  deepLinkCreated: false,
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
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function appIntegrationDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewAppIntegrationContractEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_CONTRACT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewAppIntegrationAttachmentEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_ATTACHMENT_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewAppIntegrationVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewAppIntegrationCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_COMPATIBILITY_CHECK_FLAG);
}

export default {
  APP_INTEGRATION_CONTRACT_VERSION,
  APP_INTEGRATION_CONTRACT_CAPABILITIES,
};
