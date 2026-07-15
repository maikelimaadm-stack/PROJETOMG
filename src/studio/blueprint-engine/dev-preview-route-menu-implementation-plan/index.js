/**
 * STUDIO DEV PREVIEW ROUTE/MENU IMPLEMENTATION PLAN — public surface (headless / plan-only).
 *
 * Despite the name, this subtree IMPLEMENTS NO route/menu. It consumes a Dev Preview Route/Menu
 * Contract and produces the deterministic PLAN for a future controlled route/menu implementation —
 * implementation phases, App/router wiring boundary plans, route/menu registration plans, sidebar/
 * navigation placement plan, dev-only access policy, route guard and menu visibility implementation
 * plans, deep-link policy plan, runtime UI mount boundary plan, blocked-navigation action plan,
 * test harness plan, manual enablement gate plan, rollout/rollback plan, observability/diagnostics
 * plan and prototype-relink prohibition plan. It is pure metadata: it creates NO real route/menu/
 * router, NO App/router/navigation/sidebar wiring, NO router primitives, NO runtime UI mount, NO
 * deep link, NO module, and never touches backend / Prisma / migration / network / production /
 * staging, never mutates, never persists, never reads/writes real data, never rewrites Empresas,
 * and NEVER relinks the old Studio prototype. Nothing here is auto-consumed by the app; reversible
 * by non-consumption. It authorizes NO route/menu implementation and NO App integration. No
 * `.jsx` / `.tsx` / `.css`.
 */

export {
  ROUTE_MENU_IMPLEMENTATION_PLAN_NAME,
  ROUTE_MENU_IMPLEMENTATION_PLAN_SEMVER,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_MODE,
  ROUTE_MENU_IMPLEMENTATION_PLAN_ENVIRONMENT,
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
  ROUTE_MENU_IMPLEMENTATION_PHASE_IDS,
  BLOCKED_NAVIGATION_KINDS,
  FORBIDDEN_PROTOTYPE_PATHS,
  ROUTE_MENU_IMPLEMENTATION_PLAN_READINESS_STATES,
  REQUIRED_FUTURE_CHECKPOINT,
  ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PLAN_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_PHASES_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_VERIFY_FLAG,
  MAK_STUDIO_DEV_PREVIEW_ROUTE_MENU_IMPLEMENTATION_COMPATIBILITY_CHECK_FLAG,
  routeMenuPlanDigest,
  isProductionEnv,
  isStudioDevPreviewRouteMenuImplementationPlanEnabled,
  isStudioDevPreviewRouteMenuImplementationPhasesEnabled,
  isStudioDevPreviewRouteMenuImplementationVerifyEnabled,
  isStudioDevPreviewRouteMenuImplementationCompatibilityCheckEnabled,
} from './routeMenuImplementationPlanConfig.js';

export {
  ROUTE_MENU_IMPLEMENTATION_PLAN_ERROR_CODES,
  RouteMenuImplementationPlanError,
  createRouteMenuImplementationPlanError,
  routeMenuImplementationPlanError,
} from './errors.js';

export { createRouteMenuImplementationPlanSession } from './createRouteMenuImplementationPlanSession.js';
export { createRouteMenuImplementationPhases } from './createRouteMenuImplementationPhases.js';
export { createAppWiringBoundaryPlan } from './createAppWiringBoundaryPlan.js';
export { createRouterWiringBoundaryPlan } from './createRouterWiringBoundaryPlan.js';
export { createRouteRegistrationPlan } from './createRouteRegistrationPlan.js';
export { createMenuRegistrationPlan } from './createMenuRegistrationPlan.js';
export { createSidebarNavigationPlacementPlan } from './createSidebarNavigationPlacementPlan.js';
export { createDevOnlyAccessPolicy } from './createDevOnlyAccessPolicy.js';
export { createRouteGuardImplementationPlan } from './createRouteGuardImplementationPlan.js';
export { createMenuVisibilityImplementationPlan } from './createMenuVisibilityImplementationPlan.js';
export { createDeepLinkPolicyPlan } from './createDeepLinkPolicyPlan.js';
export { createRuntimeUiMountBoundaryPlan } from './createRuntimeUiMountBoundaryPlan.js';
export { createBlockedNavigationActionPlan } from './createBlockedNavigationActionPlan.js';
export { createRouteMenuTestHarnessPlan } from './createRouteMenuTestHarnessPlan.js';
export { createRouteMenuManualEnablementGatePlan } from './createRouteMenuManualEnablementGatePlan.js';
export { createRouteMenuRolloutRollbackPlan } from './createRouteMenuRolloutRollbackPlan.js';
export { createRouteMenuObservabilityDiagnosticsPlan } from './createRouteMenuObservabilityDiagnosticsPlan.js';
export { createPrototypeRelinkProhibitionPlan } from './createPrototypeRelinkProhibitionPlan.js';
export { createRouteMenuSafetyPlan } from './createRouteMenuSafetyPlan.js';
export { createRouteMenuImplementationReadinessDecision } from './createRouteMenuImplementationReadinessDecision.js';
export { createRouteMenuImplementationPlanManifest } from './createRouteMenuImplementationPlanManifest.js';
export { verifyRouteMenuImplementationPlan } from './verifyRouteMenuImplementationPlan.js';
export { checkRouteMenuImplementationPlanCompatibility } from './checkRouteMenuImplementationPlanCompatibility.js';
export { createRouteMenuImplementationPlanDiagnostics } from './createRouteMenuImplementationPlanDiagnostics.js';
export { createRouteMenuImplementationPlanFallback } from './createRouteMenuImplementationPlanFallback.js';
export { createStudioDevPreviewRouteMenuImplementationPlan } from './createStudioDevPreviewRouteMenuImplementationPlan.js';

export { default } from './createStudioDevPreviewRouteMenuImplementationPlan.js';
