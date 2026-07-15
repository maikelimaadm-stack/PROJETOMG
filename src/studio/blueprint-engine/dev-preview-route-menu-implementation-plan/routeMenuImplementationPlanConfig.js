/**
 * Config + flags for the STUDIO DEV PREVIEW ROUTE/MENU IMPLEMENTATION PLAN.
 *
 * Despite the name, this layer is HEADLESS, CONTRACT-ONLY and PLAN-ONLY: it consumes the Dev
 * Preview Route/Menu Contract and produces the deterministic PLAN for a future controlled route/
 * menu implementation — implementation phases, App/router wiring boundary plans, route/menu
 * registration plans, sidebar/navigation placement plan, dev-only access policy, route guard and
 * menu visibility implementation plans, deep-link policy plan, runtime UI mount boundary plan,
 * blocked-navigation action plan, test harness plan, manual enablement gate plan, rollout/rollback
 * plan, observability/diagnostics plan and prototype-relink prohibition plan. It IMPLEMENTS NO
 * route/menu. It creates NO real route/menu/router, NO App/router/navigation/sidebar wiring, NO
 * `Route`/`Routes`/`Link`/`NavLink`/`BrowserRouter`/`createBrowserRouter`/`useNavigate`, NO
 * `ReactDOM`/`createRoot`/`window`/`document` mount, NO deep link, NO module, writes NO file under
 * `src/modules`, never touches backend/Prisma/migration/network/production/staging, never mutates,
 * never persists, never reads/writes real data, never rewrites Empresas, and NEVER imports or
 * relinks the old Studio prototype. Default disabled; headless only; fails closed in production;
 * nothing is auto-consumed by the app; reversible by non-consumption. It authorizes NO route/menu
 * implementation and NO App integration — only a future, separately-approved slice (after an
 * enterprise checkpoint) may.
 *
 * Lives under `src/studio/` -> browser eslint globals -> uses `globalThis.process`, never a bare
 * `process`. NO React import (pure config). No `.jsx`/`.tsx`/`.css`.
 */

import { createGenericModelChecksum } from '../../../runtime/generic-model/index.js';

export const ROUTE_MENU_IMPLEMENTATION_PLAN_NAME = 'studio-dev-preview-route-menu-implementation-plan';
export const ROUTE_MENU_IMPLEMENTATION_PLAN_SEMVER = '1.0.0';
export const ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION = 'studio-dev-preview-route-menu-implementation-plan@1.0.0';
export const ROUTE_MENU_IMPLEMENTATION_PLAN_MODE = 'headless_dev_preview_route_menu_implementation_plan';
export const ROUTE_MENU_IMPLEMENTATION_PLAN_ENVIRONMENT = 'local_contract';

/** Upstream references (consumed read-only). */
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

/** The planned implementation phases (planned metadata only — none implemented). */
export const ROUTE_MENU_IMPLEMENTATION_PHASE_IDS = Object.freeze([
  'phase_0_preflight',
  'phase_1_contract_validation',
  'phase_2_app_wiring_boundary',
  'phase_3_router_wiring_boundary',
  'phase_4_route_registration_plan',
  'phase_5_menu_registration_plan',
  'phase_6_sidebar_navigation_placement',
  'phase_7_dev_only_access_policy',
  'phase_8_route_guard_and_visibility',
  'phase_9_runtime_ui_mount_boundary',
  'phase_10_test_harness',
  'phase_11_manual_enablement_gate',
  'phase_12_rollout_blocked',
]);

/** Navigation actions the plan permanently blocks (enforcement plan, metadata only). */
export const BLOCKED_NAVIGATION_KINDS = Object.freeze([
  'navigate', 'openRoute', 'deepLink', 'registerRoute', 'registerMenu', 'registerSidebarItem',
  'registerNavigationItem', 'mountRuntimeUi', 'registerModule',
]);

/** Old Studio prototype paths that must NEVER be relinked/imported. */
export const FORBIDDEN_PROTOTYPE_PATHS = Object.freeze([
  'src/studio/components/', 'src/studio/shell/', 'src/studio/designers/', 'src/studio/pages/',
  'src/studio/navigation/', 'src/studio/dock/', 'src/studio/panels/', 'src/studio/editor/',
]);

/** Readiness classifications the plan can emit. */
export const ROUTE_MENU_IMPLEMENTATION_PLAN_READINESS_STATES = Object.freeze([
  'studio_dev_preview_route_menu_implementation_plan_ready',
  'ready_for_future_route_menu_implementation_slice_after_enterprise_checkpoint',
  'needs_route_menu_contract_fix', 'needs_runtime_ui_fix', 'blocked', 'invalid',
]);

/** The manual checkpoint a future real route/menu implementation slice will require. */
export const REQUIRED_FUTURE_CHECKPOINT = 'pre_route_menu_implementation_enterprise_checkpoint';

export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN';
export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PHASES_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PHASES';
export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_VERIFY_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_VERIFY';
export const MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG = 'MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_COMPATIBILITY_CHECK';

/**
 * Immutable capability flags. Every `*Only` PLAN capability is TRUE; every real route / menu /
 * wiring / mount / module / backend / production / mutation / real-data capability is FALSE.
 */
export const ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES = Object.freeze({
  headless: true,
  contractOnly: true,
  metadataOnly: true,
  planOnly: true,
  implementationPhasesOnly: true,
  appWiringBoundaryPlanOnly: true,
  routerWiringBoundaryPlanOnly: true,
  routeRegistrationPlanOnly: true,
  menuRegistrationPlanOnly: true,
  sidebarNavigationPlacementPlanOnly: true,
  devOnlyAccessPolicyOnly: true,
  routeGuardImplementationPlanOnly: true,
  menuVisibilityImplementationPlanOnly: true,
  deepLinkPolicyPlanOnly: true,
  runtimeUiMountBoundaryPlanOnly: true,
  blockedNavigationActionPlanOnly: true,
  testHarnessPlanOnly: true,
  manualEnablementGatePlanOnly: true,
  rolloutRollbackPlanOnly: true,
  observabilityDiagnosticsPlanOnly: true,
  prototypeRelinkProhibitionPlanOnly: true,
  routeImplemented: false,
  menuImplemented: false,
  appWiringImplemented: false,
  routerWiringImplemented: false,
  navigationWiringImplemented: false,
  sidebarWiringImplemented: false,
  deepLinkImplemented: false,
  runtimeUiMounted: false,
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
  realDataRead: false,
  realDataWrite: false,
  rewriteEmpresas: false,
  oldPrototypeImported: false,
});

/** Deterministic digest (FNV-1a via the runtime helper). Never mutates input. */
export function routeMenuPlanDigest(value) {
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
  const requested = env[flag] === 'true' || env[MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG] === 'true';
  if (!requested) return false;
  return !isProductionEnv(env); // headless/local: fails closed in production, no escape.
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuImplementationPlanEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuImplementationPhasesEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PHASES_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuImplementationVerifyEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_VERIFY_FLAG);
}

/** @param {Record<string, unknown>} [env] */
export function isStudioDevPreviewRouteMenuImplementationCompatibilityCheckEnabled(env) {
  return flagEnabled(env ?? resolveEnv(), MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG);
}

export default {
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES,
};
