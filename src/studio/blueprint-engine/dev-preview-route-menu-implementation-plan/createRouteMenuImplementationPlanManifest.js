import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_IMPLEMENTATION_PLAN_NAME,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_CONTRACT_VERSION,
  RUNTIME_UI_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES,
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

/**
 * Builds the plan manifest with deterministic digests for every plan part. Pure — can build
 * standalone (parts recomputed) or from provided parts.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @param {Object} [options.parts]
 * @returns {Object}
 */
export function createRouteMenuImplementationPlanManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};
  const p = isGenericModelPlainObject(o.parts) ? o.parts : {};

  const session = p.session ?? createRouteMenuImplementationPlanSession({ routeMenuContract: c });
  const phases = p.phases ?? createRouteMenuImplementationPhases();
  const appWiringBoundary = p.appWiringBoundary ?? createAppWiringBoundaryPlan();
  const routerWiringBoundary = p.routerWiringBoundary ?? createRouterWiringBoundaryPlan();
  const routeRegistration = p.routeRegistration ?? createRouteRegistrationPlan({ routeMenuContract: c });
  const menuRegistration = p.menuRegistration ?? createMenuRegistrationPlan({ routeMenuContract: c });
  const sidebarNavigationPlacement = p.sidebarNavigationPlacement ?? createSidebarNavigationPlacementPlan();
  const devOnlyAccessPolicy = p.devOnlyAccessPolicy ?? createDevOnlyAccessPolicy();
  const routeGuard = p.routeGuard ?? createRouteGuardImplementationPlan();
  const menuVisibility = p.menuVisibility ?? createMenuVisibilityImplementationPlan();
  const deepLinkPolicy = p.deepLinkPolicy ?? createDeepLinkPolicyPlan();
  const runtimeUiMountBoundary = p.runtimeUiMountBoundary ?? createRuntimeUiMountBoundaryPlan();
  const blockedNavigation = p.blockedNavigation ?? createBlockedNavigationActionPlan();
  const testHarness = p.testHarness ?? createRouteMenuTestHarnessPlan();
  const manualGate = p.manualGate ?? createRouteMenuManualEnablementGatePlan();
  const rolloutRollback = p.rolloutRollback ?? createRouteMenuRolloutRollbackPlan();
  const observability = p.observability ?? createRouteMenuObservabilityDiagnosticsPlan();
  const prototypeRelinkProhibition = p.prototypeRelinkProhibition ?? createPrototypeRelinkProhibitionPlan();
  const safety = p.safety ?? createRouteMenuSafetyPlan();
  const readiness = p.readiness ?? null;

  const parts = {
    session: session.sessionDigest,
    phases: phases.phasesDigest,
    appWiringBoundary: appWiringBoundary.appWiringBoundaryDigest,
    routerWiringBoundary: routerWiringBoundary.routerWiringBoundaryDigest,
    routeRegistration: routeRegistration.routeRegistrationDigest,
    menuRegistration: menuRegistration.menuRegistrationDigest,
    sidebarNavigationPlacement: sidebarNavigationPlacement.sidebarNavigationPlacementDigest,
    devOnlyAccessPolicy: devOnlyAccessPolicy.devOnlyAccessPolicyDigest,
    routeGuard: routeGuard.routeGuardImplementationDigest,
    menuVisibility: menuVisibility.menuVisibilityImplementationDigest,
    deepLinkPolicy: deepLinkPolicy.deepLinkPolicyDigest,
    runtimeUiMountBoundary: runtimeUiMountBoundary.runtimeUiMountBoundaryDigest,
    blockedNavigation: blockedNavigation.blockedNavigationDigest,
    testHarness: testHarness.testHarnessDigest,
    manualGate: manualGate.manualGateDigest,
    rolloutRollback: rolloutRollback.rolloutRollbackDigest,
    observability: observability.observabilityDigest,
    prototypeRelinkProhibition: prototypeRelinkProhibition.prototypeRelinkProhibitionDigest,
    safety: safety.safetyDigest,
    readiness: readiness && readiness.readinessDigest ? readiness.readinessDigest : null,
  };

  const core = {
    kind: 'route-menu-implementation-plan-manifest',
    routeMenuImplementationPlanName: ROUTE_MENU_IMPLEMENTATION_PLAN_NAME,
    routeMenuImplementationPlanVersion: ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
    upstream: {
      routeMenuContract: ROUTE_MENU_CONTRACT_VERSION,
      runtimeUi: RUNTIME_UI_VERSION,
    },
    parts,
    capabilities: { ...ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: routeMenuPlanDigest(core) });
}

export default createRouteMenuImplementationPlanManifest;
