import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_IMPLEMENTATION_PLAN_NAME,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_MODE,
  ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES,
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
  routeMenuPlanDigest,
} from './routeMenuImplementationPlanConfig.js';
import { createRouteMenuImplementationPlanSession } from './createRouteMenuImplementationPlanSession.js';
import { createRouteMenuImplementationPhases } from './createRouteMenuImplementationPhases.js';
import { createAppWiringBoundaryPlan } from './createAppWiringBoundaryPlan.js';
import { createRouterWiringBoundaryPlan } from './createRouterWiringBoundaryPlan.js';
import { createRouteRegistrationPlan } from './createRouteRegistrationPlan.js';
import { createMenuRegistrationPlan } from './createMenuRegistrationPlan.js';
import { createSidebarNavigationPlacementPlan } from './createSidebarNavigationPlacementPlan.js';
import { createDevOnlyAccessPolicy } from './createDevOnlyAccessPolicy.js';
import { createRouteGuardImplementationPlan } from './createRouteGuardImplementationPlan.js';
import { createMenuVisibilityImplementationPlan } from './createMenuVisibilityImplementationPlan.js';
import { createDeepLinkPolicyPlan } from './createDeepLinkPolicyPlan.js';
import { createRuntimeUiMountBoundaryPlan } from './createRuntimeUiMountBoundaryPlan.js';
import { createBlockedNavigationActionPlan } from './createBlockedNavigationActionPlan.js';
import { createRouteMenuTestHarnessPlan } from './createRouteMenuTestHarnessPlan.js';
import { createRouteMenuManualEnablementGatePlan } from './createRouteMenuManualEnablementGatePlan.js';
import { createRouteMenuRolloutRollbackPlan } from './createRouteMenuRolloutRollbackPlan.js';
import { createRouteMenuObservabilityDiagnosticsPlan } from './createRouteMenuObservabilityDiagnosticsPlan.js';
import { createPrototypeRelinkProhibitionPlan } from './createPrototypeRelinkProhibitionPlan.js';
import { createRouteMenuSafetyPlan } from './createRouteMenuSafetyPlan.js';
import { createRouteMenuImplementationReadinessDecision } from './createRouteMenuImplementationReadinessDecision.js';
import { createRouteMenuImplementationPlanManifest } from './createRouteMenuImplementationPlanManifest.js';
import { verifyRouteMenuImplementationPlan } from './verifyRouteMenuImplementationPlan.js';
import { checkRouteMenuImplementationPlanCompatibility } from './checkRouteMenuImplementationPlanCompatibility.js';
import { createRouteMenuImplementationPlanDiagnostics } from './createRouteMenuImplementationPlanDiagnostics.js';
import { createRouteMenuImplementationPlanFallback } from './createRouteMenuImplementationPlanFallback.js';

/**
 * Composes the STUDIO DEV PREVIEW ROUTE/MENU IMPLEMENTATION PLAN from a Dev Preview Route/Menu
 * Contract. Pure, deterministic, HEADLESS, CONTRACT-ONLY and PLAN-ONLY. Given the same route/menu
 * contract it always returns the same object graph and digest.
 *
 * It plans a future controlled route/menu implementation as pure metadata. It IMPLEMENTS NO
 * route/menu. It creates NO real route/menu/router, NO App/router/navigation/sidebar wiring, NO
 * router primitives, NO runtime UI mount (no ReactDOM/createRoot/window/document), NO deep link, NO
 * module, and never touches backend/Prisma/migration/network/production/staging, never mutates,
 * never persists, never reads/writes real data, never rewrites Empresas, and NEVER relinks the old
 * Studio prototype. On an invalid/missing/fallback route/menu contract it returns a safe fallback
 * and never throws. It authorizes NO route/menu implementation and NO App integration.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract] a dev preview route/menu contract
 * @returns {Object} the route/menu implementation plan
 */
export function createStudioDevPreviewRouteMenuImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const routeMenuContract = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : null;

  if (!routeMenuContract
    || routeMenuContract.kind !== 'studio-dev-preview-route-menu-contract'
    || routeMenuContract.fallback === true) {
    return createRouteMenuImplementationPlanFallback({
      reason: routeMenuContract ? 'invalid_or_fallback_route_menu_contract' : 'invalid_or_missing_route_menu_contract',
    });
  }

  const session = createRouteMenuImplementationPlanSession({ routeMenuContract });
  const phases = createRouteMenuImplementationPhases();
  const appWiringBoundary = createAppWiringBoundaryPlan();
  const routerWiringBoundary = createRouterWiringBoundaryPlan();
  const routeRegistration = createRouteRegistrationPlan({ routeMenuContract });
  const menuRegistration = createMenuRegistrationPlan({ routeMenuContract });
  const sidebarNavigationPlacement = createSidebarNavigationPlacementPlan();
  const devOnlyAccessPolicy = createDevOnlyAccessPolicy();
  const routeGuard = createRouteGuardImplementationPlan();
  const menuVisibility = createMenuVisibilityImplementationPlan();
  const deepLinkPolicy = createDeepLinkPolicyPlan();
  const runtimeUiMountBoundary = createRuntimeUiMountBoundaryPlan();
  const blockedNavigation = createBlockedNavigationActionPlan();
  const testHarness = createRouteMenuTestHarnessPlan();
  const manualGate = createRouteMenuManualEnablementGatePlan();
  const rolloutRollback = createRouteMenuRolloutRollbackPlan();
  const observability = createRouteMenuObservabilityDiagnosticsPlan();
  const prototypeRelinkProhibition = createPrototypeRelinkProhibitionPlan();
  const safety = createRouteMenuSafetyPlan();

  const compatibility = checkRouteMenuImplementationPlanCompatibility({ routeMenuContract });

  const blockers = [];
  const warnings = [...(Array.isArray(compatibility.warnings) ? compatibility.warnings : [])];
  if (appWiringBoundary.appWiringImplemented === true) blockers.push('route_menu_plan_app_wiring_unsafe');
  if (routerWiringBoundary.routerWiringImplemented === true) blockers.push('route_menu_plan_router_wiring_unsafe');
  if (routeRegistration.routeCreated === true) blockers.push('route_menu_plan_route_created_unsafe');
  if (menuRegistration.menuCreated === true) blockers.push('route_menu_plan_menu_created_unsafe');
  if (runtimeUiMountBoundary.runtimeUiMounted === true) blockers.push('route_menu_plan_runtime_ui_mounted_unsafe');
  if (deepLinkPolicy.deepLinkImplemented === true) blockers.push('route_menu_plan_deep_link_unsafe');
  if (blockedNavigation.anyAllowed === true) blockers.push('route_menu_plan_navigation_unsafe');
  if (safety.anyForbiddenSideEffect === true) blockers.push('route_menu_plan_safety_unsafe');
  if (manualGate.manualGateRequired !== true) blockers.push('route_menu_plan_manual_gate_missing');
  if (prototypeRelinkProhibition.prototypeRelinkAllowed === true) blockers.push('route_menu_plan_prototype_relink_unsafe');

  const readiness = createRouteMenuImplementationReadinessDecision({ blockers, warnings });

  const parts = {
    session, phases, appWiringBoundary, routerWiringBoundary, routeRegistration, menuRegistration,
    sidebarNavigationPlacement, devOnlyAccessPolicy, routeGuard, menuVisibility, deepLinkPolicy,
    runtimeUiMountBoundary, blockedNavigation, testHarness, manualGate, rolloutRollback,
    observability, prototypeRelinkProhibition, safety, readiness,
  };
  const manifest = createRouteMenuImplementationPlanManifest({ routeMenuContract, parts });

  const core = {
    kind: 'studio-dev-preview-route-menu-implementation-plan',
    routeMenuImplementationPlanName: ROUTE_MENU_IMPLEMENTATION_PLAN_NAME,
    routeMenuImplementationPlanVersion: ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
    routeMenuContractVersion: ROUTE_MENU_CONTRACT_VERSION,
    runtimeUiVersion: RUNTIME_UI_VERSION,
    runtimeUiContractVersion: RUNTIME_UI_CONTRACT_VERSION,
    isolatedRuntimeVersion: ISOLATED_RUNTIME_VERSION,
    runtimeShellContractVersion: RUNTIME_SHELL_CONTRACT_VERSION,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    sandboxVersion: MODULE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    plannerVersion: MODULE_REFERENCE_PLANNER_VERSION,
    engineVersion: STUDIO_BLUEPRINT_ENGINE_VERSION,
    blueprintContractVersion: STUDIO_BLUEPRINT_CONTRACT_VERSION,
    mode: ROUTE_MENU_IMPLEMENTATION_PLAN_MODE,
    moduleId: String(routeMenuContract.moduleId ?? 'plannedModule'),
    fallback: false,
    session,
    phases,
    appWiringBoundary,
    routerWiringBoundary,
    routeRegistration,
    menuRegistration,
    sidebarNavigationPlacement,
    devOnlyAccessPolicy,
    routeGuard,
    menuVisibility,
    deepLinkPolicy,
    runtimeUiMountBoundary,
    blockedNavigation,
    testHarness,
    manualGate,
    rolloutRollback,
    observability,
    prototypeRelinkProhibition,
    safety,
    compatibility,
    readiness: typeof readiness.readiness === 'string' ? readiness.readiness : 'blocked',
    readinessDecision: readiness,
    manifest,
    readyForRouteMenuImplementationPlan: readiness.readyForRouteMenuImplementationPlan === true,
    readyForRouteMenuImplementationSlice: false,
    readyForAppIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers,
    warnings,
    blockerCount: blockers.length,
    warningCount: warnings.length,
    capabilities: { ...ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };

  const plan = safeCloneGenericModel({ ...core, overallDigest: routeMenuPlanDigest(core) });

  const verification = verifyRouteMenuImplementationPlan({ plan });
  const diagnostics = createRouteMenuImplementationPlanDiagnostics({ verification, compatibility });

  return safeCloneGenericModel({
    ...plan,
    verification,
    diagnostics,
    routeMenuImplementationPlanDigest: routeMenuPlanDigest({ overallDigest: plan.overallDigest, verification, diagnostics }),
  });
}

export default createStudioDevPreviewRouteMenuImplementationPlan;
