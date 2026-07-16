/**
 * Config + flags for the STUDIO DEV PREVIEW APP INTEGRATION IMPLEMENTATION PLAN.
 *
 * Despite the name, this layer is HEADLESS, CONTRACT-ONLY, METADATA-ONLY and PLAN-ONLY: it consumes
 * the Dev Preview App Integration Contract and produces the deterministic PLAN for a FUTURE
 * controlled integration of the isolated dev-preview host with the real App — implementation
 * phases, App touch boundary plan, productionUiGuard extension plan, feature flag implementation
 * plan, App attachment plan, router/menu/sidebar exposure plans, Runtime UI mount plan, dependency
 * injection plan, lifecycle/cleanup plan, failure containment plan, production/staging fail-closed
 * plan, prototype-relink static-assertion plan, governance registry plan, test harness plan, manual
 * enablement gate plan, rollout/rollback plan and observability/diagnostics plan.
 *
 * It IMPLEMENTS NO integration. It creates NO App/router/menu/sidebar wiring, NO route/menu
 * exposure, NO Runtime UI mount in the App, NO feature flag connected to the App, NO
 * productionUiGuard extension, NO `Route`/`Routes`/`Link`/`NavLink`/`BrowserRouter`/
 * `createBrowserRouter`/`useNavigate`, NO `ReactDOM`/`createRoot`/`window`/`document`, NO public
 * deep link, NO module, writes NO file under `src/modules`, never touches `src/App.jsx`, backend/
 * Prisma/migration/network/production/staging, never mutates, never persists, never reads/writes
 * real data, never rewrites Empresas, and NEVER imports or relinks the old Studio prototype. Default
 * disabled; headless only; fails closed in production; reversible by non-consumption. It authorizes
 * NO App integration implementation slice — only a future, separately-approved slice (after an
 * enterprise checkpoint) may.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME = 'studio-dev-preview-app-integration-implementation-plan';
export const APP_INTEGRATION_IMPLEMENTATION_PLAN_SEMVER = '1.0.0';
export const APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-app-integration-implementation-plan@1.0.0';
export const APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE = 'headless_dev_preview_app_integration_implementation_plan';
export const APP_INTEGRATION_IMPLEMENTATION_PLAN_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
export const APP_INTEGRATION_CONTRACT_VERSION = 'studio-dev-preview-app-integration-contract@1.0.0';
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

/** The manual checkpoint a future real App integration implementation slice will require. */
export const REQUIRED_FUTURE_CHECKPOINT = 'pre_app_integration_implementation_enterprise_checkpoint';

/** The planned implementation phases (planned metadata only — none implemented). */
export const APP_INTEGRATION_IMPLEMENTATION_PHASE_IDS = Object.freeze([
  'phase_0_preflight',
  'phase_1_contract_validation',
  'phase_2_scope_registry_preparation',
  'phase_3_app_touch_boundary',
  'phase_4_production_ui_guard_extension_plan',
  'phase_5_feature_flag_plan',
  'phase_6_app_attachment_plan',
  'phase_7_router_exposure_plan',
  'phase_8_menu_sidebar_exposure_plan',
  'phase_9_runtime_ui_mount_boundary',
  'phase_10_dependency_injection_boundary',
  'phase_11_failure_containment',
  'phase_12_test_harness',
  'phase_13_manual_enablement_gate',
  'phase_14_rollout_blocked',
]);

/** Integration actions the plan permanently blocks (enforcement plan, metadata only). */
export const BLOCKED_INTEGRATION_KINDS = Object.freeze([
  'touchApp', 'wireAppRouter', 'wireProductMenu', 'wireProductSidebar', 'exposeProductRoute',
  'exposeProductMenu', 'mountRuntimeUiInApp', 'connectFeatureFlagToApp', 'extendProductionUiGuard',
  'createPublicDeepLink', 'registerModule', 'accessBackend', 'accessPrisma', 'readRealData',
  'writeRealData',
]);

/** Old Studio prototype paths that must NEVER be relinked/imported. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Readiness classifications the plan can emit. */
export const APP_INTEGRATION_IMPLEMENTATION_PLAN_READINESS_STATES = Object.freeze([
  'studio_dev_preview_app_integration_implementation_plan_ready',
  'ready_for_future_app_integration_implementation_slice_after_enterprise_checkpoint',
  'needs_app_integration_contract_fix', 'needs_route_menu_runtime_fix', 'blocked', 'invalid',
]);

export const MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG = 'MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN';
export const MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PHASES_FLAG = 'MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PHASES';
export const MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. Every `*Only`/PLAN capability is TRUE; every real App / router / menu
 * / sidebar / mount / feature-flag / guard-extension / module / backend / production / mutation /
 * real-data / prototype capability is FALSE. Default is plan-only.
 */
export const APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  planOnly: true,
  implementationPhasesOnly: true,
  appTouchBoundaryPlanOnly: true,
  productionUiGuardExtensionPlanOnly: true,
  featureFlagImplementationPlanOnly: true,
  appAttachmentImplementationPlanOnly: true,
  routerExposureImplementationPlanOnly: true,
  menuSidebarExposureImplementationPlanOnly: true,
  runtimeUiMountImplementationPlanOnly: true,
  dependencyInjectionImplementationPlanOnly: true,
  lifecycleCleanupImplementationPlanOnly: true,
  failureContainmentImplementationPlanOnly: true,
  productionStagingFailClosedPlanOnly: true,
  prototypeRelinkStaticAssertionPlanOnly: true,
  testHarnessPlanOnly: true,
  manualEnablementGatePlanOnly: true,
  rolloutRollbackPlanOnly: true,
  observabilityDiagnosticsPlanOnly: true,
  governanceRegistryPlanOnly: true,
  appIntegrated: false,
  appTouched: false,
  appWiringImplemented: false,
  productionUiGuardExtended: false,
  featureFlagImplemented: false,
  featureFlagConnectedToApp: false,
  routerWiringImplemented: false,
  routeExposedToProduct: false,
  menuExposedToProduct: false,
  sidebarExposedToProduct: false,
  runtimeUiMountedInApp: false,
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
  oldPrototypeImported: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function appIntegrationPlanDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewAppIntegrationImplementationPlanEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewAppIntegrationImplementationPhasesEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PHASES_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewAppIntegrationImplementationVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewAppIntegrationImplementationCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG);
}

export default {
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES,
};
