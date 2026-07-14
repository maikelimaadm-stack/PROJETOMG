/**
 * STUDIO DEV PREVIEW ROUTE/MENU CONTRACT — public surface (headless / contract-only).
 *
 * This subtree consumes the Dev Preview Runtime UI and produces the deterministic CONTRACT for a
 * future, controlled route/menu integration — route descriptor / eligibility / guard / isolation /
 * visibility / access decision, menu placement / visibility / eligibility, navigation boundary,
 * deep-link blocked, App/router/menu wiring blocked, manual enablement gate, rollout/rollback and
 * safety. It is pure metadata: it creates NO real route / menu / router, NO App/router/navigation/
 * sidebar wiring, NO `Route`/`Routes`/`NavLink`/`Link`/`BrowserRouter`/`createBrowserRouter`/
 * `useNavigate`, NO deep link, NO module, and never touches backend / Prisma / migration / network
 * / production / staging, never mutates, never persists, never reads/writes real data, never
 * rewrites Empresas, and NEVER imports the old Studio prototype. Nothing here is auto-consumed by
 * the app; it is reversible by non-consumption. It authorizes NO route/menu implementation and NO
 * App integration. No `.jsx` / `.tsx` / `.css`.
 */

export {
  ROUTE_MENU_CONTRACT_NAME,
  ROUTE_MENU_CONTRACT_SEMVER,
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_CONTRACT_MODE,
  ROUTE_MENU_CONTRACT_ENVIRONMENT,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  DEV_PREVIEW_BRIDGE_VERSION,
  MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  MODULE_REFERENCE_PLANNER_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  STUDIO_BLUEPRINT_CONTRACT_VERSION,
  BLOCKED_NAVIGATION_KINDS,
  ROUTE_MENU_CONTRACT_READINESS_STATES,
  REQUIRED_FUTURE_CHECKPOINT,
  ROUTE_MENU_CONTRACT_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_CONTRACT_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_DESCRIPTOR_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_COMPATIBILITY_CHECK_FLAG,
  routeMenuDigest,
  isProductionEnv,
  isStudioDevPreviewRouteMenuContractEnabled,
  isStudioDevPreviewRouteMenuDescriptorEnabled,
  isStudioDevPreviewRouteMenuVerifyEnabled,
  isStudioDevPreviewRouteMenuCompatibilityCheckEnabled,
} from './routeMenuContractConfig.js';

export {
  ROUTE_MENU_CONTRACT_ERROR_CODES,
  RouteMenuContractError,
  createRouteMenuContractError,
  routeMenuContractError,
} from './errors.js';

export { createRouteMenuContractSession } from './createRouteMenuContractSession.js';
export { createDevPreviewRouteDescriptorContract } from './createDevPreviewRouteDescriptorContract.js';
export { createDevPreviewRouteEligibilityContract } from './createDevPreviewRouteEligibilityContract.js';
export { createDevPreviewRouteGuardContract } from './createDevPreviewRouteGuardContract.js';
export { createDevPreviewRouteIsolationContract } from './createDevPreviewRouteIsolationContract.js';
export { createDevPreviewRouteVisibilityContract } from './createDevPreviewRouteVisibilityContract.js';
export { createDevPreviewRouteAccessDecision } from './createDevPreviewRouteAccessDecision.js';
export { createDevPreviewMenuPlacementContract } from './createDevPreviewMenuPlacementContract.js';
export { createDevPreviewMenuVisibilityContract } from './createDevPreviewMenuVisibilityContract.js';
export { createDevPreviewMenuEligibilityContract } from './createDevPreviewMenuEligibilityContract.js';
export { createDevPreviewNavigationBoundaryContract } from './createDevPreviewNavigationBoundaryContract.js';
export { createDevPreviewDeepLinkBlockedContract } from './createDevPreviewDeepLinkBlockedContract.js';
export { createDevPreviewAppWiringBlockedContract } from './createDevPreviewAppWiringBlockedContract.js';
export { createDevPreviewManualEnablementGateContract } from './createDevPreviewManualEnablementGateContract.js';
export { createDevPreviewRouteMenuRolloutRollbackContract } from './createDevPreviewRouteMenuRolloutRollbackContract.js';
export { createDevPreviewRouteMenuSafetyContract } from './createDevPreviewRouteMenuSafetyContract.js';
export { createDevPreviewRouteMenuReadinessDecision } from './createDevPreviewRouteMenuReadinessDecision.js';
export { createDevPreviewRouteMenuManifest } from './createDevPreviewRouteMenuManifest.js';
export { verifyDevPreviewRouteMenuContract } from './verifyDevPreviewRouteMenuContract.js';
export { checkDevPreviewRouteMenuCompatibility } from './checkDevPreviewRouteMenuCompatibility.js';
export { createDevPreviewRouteMenuDiagnostics } from './createDevPreviewRouteMenuDiagnostics.js';
export { createDevPreviewRouteMenuFallback } from './createDevPreviewRouteMenuFallback.js';
export { createStudioDevPreviewRouteMenuContract } from './createStudioDevPreviewRouteMenuContract.js';

export { default } from './createStudioDevPreviewRouteMenuContract.js';
