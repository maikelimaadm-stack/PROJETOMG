/**
 * STUDIO DEV PREVIEW ROUTE/MENU — public surface (isolated dev-only runtime).
 *
 * This subtree is the first REAL, ISOLATED route/menu runtime of the Studio dev preview, living
 * OUTSIDE the main App. Real React/JSX lives ONLY in the sibling `.jsx` files
 * (StudioDevPreviewRouteMenuHost/Menu/RouteView/NotFound/Blocked). This `index.js` intentionally
 * exports only the pure `.js` API (config, composer, part builders, mount adapter, verifier,
 * compatibility, diagnostics, manifest, fallback) so the module graph stays JSX-free and importable
 * by the plain `node --test` runner; the renderable `.jsx` components are imported directly (by a
 * future, separately-authorized App integration slice), never mounted here. Nothing wires the main
 * App / product router / product menu / sidebar, registers a browser route / public URL / deep
 * link, uses react-router / ReactDOM / window / document / history / location, touches backend /
 * Prisma / migration / network / production / staging, mutates, persists, reads/writes real data,
 * rewrites Empresas, or imports the old Studio prototype. Default is OFF; fail-closed; reversible by
 * non-consumption.
 */

export {
  ROUTE_MENU_NAME,
  ROUTE_MENU_SEMVER,
  ROUTE_MENU_VERSION,
  ROUTE_MENU_MODE,
  ROUTE_MENU_ENVIRONMENT,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_CONTRACT_VERSION,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  REQUIRED_CHECKPOINT_RECEIPT,
  ISOLATED_ROUTE_PATHS,
  ROUTE_MENU_COMPONENT_NAMES,
  BLOCKED_NAVIGATION_KINDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  ROUTE_MENU_READINESS_STATES,
  ROUTE_MENU_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_MOUNT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK_FLAG,
  routeMenuDigest,
  resolveEnvironmentLabel,
  isDevelopmentEnvironment,
  isProductionOrStaging,
  isStudioDevPreviewRouteMenuEnabled,
  isStudioDevPreviewRouteMenuMountEnabled,
  isStudioDevPreviewRouteMenuVerifyEnabled,
  isStudioDevPreviewRouteMenuCompatibilityCheckEnabled,
} from './routeMenuConfig.js';

export {
  ROUTE_MENU_ERROR_CODES,
  RouteMenuError,
  createRouteMenuError,
  routeMenuError,
} from './errors.js';

export { createRouteMenuSession } from './createRouteMenuSession.js';
export { createRouteMenuPreflight } from './createRouteMenuPreflight.js';
export { createRouteMenuContractLoader } from './createRouteMenuContractLoader.js';
export { createRouteMenuCheckpointReceipt } from './createRouteMenuCheckpointReceipt.js';
export { createDevOnlyFeatureGate } from './createDevOnlyFeatureGate.js';
export { createIsolatedRouteRegistry } from './createIsolatedRouteRegistry.js';
export { createIsolatedRouteResolver } from './createIsolatedRouteResolver.js';
export { createIsolatedMenuRegistry } from './createIsolatedMenuRegistry.js';
export { createIsolatedNavigationController } from './createIsolatedNavigationController.js';
export { createRouteGuard } from './createRouteGuard.js';
export { createMenuVisibilityDecision } from './createMenuVisibilityDecision.js';
export { createRuntimeUiMountRequest } from './createRuntimeUiMountRequest.js';
export { mountStudioDevPreviewRouteMenu } from './createRuntimeUiMountAdapter.js';
export { createRouteMenuReactHostTree } from './createRouteMenuReactHostTree.js';
export { createBlockedNavigationModel } from './createBlockedNavigationModel.js';
export { createRouteMenuIsolationBoundary } from './createRouteMenuIsolationBoundary.js';
export { createRouteMenuManifest } from './createRouteMenuManifest.js';
export { verifyRouteMenuRuntime } from './verifyRouteMenuRuntime.js';
export { checkRouteMenuRuntimeCompatibility } from './checkRouteMenuRuntimeCompatibility.js';
export { createRouteMenuDiagnostics } from './createRouteMenuDiagnostics.js';
export { createRouteMenuFallback } from './createRouteMenuFallback.js';
export { createStudioDevPreviewRouteMenu } from './createStudioDevPreviewRouteMenu.js';

export { default } from './createStudioDevPreviewRouteMenu.js';
