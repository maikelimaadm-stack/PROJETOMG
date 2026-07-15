import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES, routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Verifies a produced route/menu implementation plan for headless / plan-only safety invariants.
 * Pure — returns a report; never throws, never mutates, never performs I/O. Any violated invariant
 * is a blocker.
 *
 * Detects: routeImplemented/menuImplemented true, App/router/navigation/sidebar wiring, runtime UI
 * mount, router primitives, ReactDOM/createRoot/window/document usage, deep-link implementation,
 * backend/Prisma, fetch/storage, production/staging, real data read/write, prototype relink,
 * missing manual gate, and forbidden-flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan]
 * @returns {Object}
 */
export function verifyRouteMenuImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const caps = isGenericModelPlainObject(plan.capabilities) ? plan.capabilities : ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'routeImplemented', 'menuImplemented', 'appWiringImplemented', 'routerWiringImplemented',
    'navigationWiringImplemented', 'sidebarWiringImplemented', 'deepLinkImplemented', 'runtimeUiMounted',
    'routeCreated', 'menuCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered',
    'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed',
    'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas',
    'oldPrototypeImported',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly', 'metadataOnly', 'planOnly'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (plan.metadataOnly === false) blockers.push('plan_must_be_metadata_only');

  // App wiring boundary.
  const aw = isGenericModelPlainObject(plan.appWiringBoundary) ? plan.appWiringBoundary : {};
  if (aw.appTouched === true) blockers.push('unsafe_app_touched');
  if (aw.appWiringImplemented === true) blockers.push('unsafe_app_wiring_implemented');

  // Router wiring boundary.
  const rw = isGenericModelPlainObject(plan.routerWiringBoundary) ? plan.routerWiringBoundary : {};
  if (rw.routerWiringImplemented === true) blockers.push('unsafe_router_wiring_implemented');
  if (rw.routeElementCreated === true || rw.routesElementCreated === true) blockers.push('unsafe_router_primitive');
  if (rw.browserRouterUsed === true || rw.createBrowserRouterUsed === true || rw.useNavigateUsed === true) blockers.push('unsafe_router_api');

  // Route/menu registration.
  const rr = isGenericModelPlainObject(plan.routeRegistration) ? plan.routeRegistration : {};
  if (rr.registrationImplemented === true || rr.routeCreated === true) blockers.push('unsafe_route_registered');
  const mr = isGenericModelPlainObject(plan.menuRegistration) ? plan.menuRegistration : {};
  if (mr.registrationImplemented === true || mr.menuCreated === true) blockers.push('unsafe_menu_registered');
  if (mr.sidebarTouched === true || mr.navigationTouched === true) blockers.push('unsafe_sidebar_navigation_touched');

  // Runtime UI mount boundary.
  const mb = isGenericModelPlainObject(plan.runtimeUiMountBoundary) ? plan.runtimeUiMountBoundary : {};
  if (mb.runtimeUiMounted === true || mb.mountImplemented === true) blockers.push('unsafe_runtime_ui_mounted');
  if (mb.reactDomUsed === true || mb.createRootUsed === true) blockers.push('unsafe_react_dom_mount');
  if (mb.windowApiUsed === true || mb.documentApiUsed === true) blockers.push('unsafe_dom_globals');

  // Deep-link policy.
  const dl = isGenericModelPlainObject(plan.deepLinkPolicy) ? plan.deepLinkPolicy : {};
  if (dl.deepLinkImplemented === true || dl.deepLinkAllowed === true) blockers.push('unsafe_deep_link');

  // Blocked navigation.
  const bn = isGenericModelPlainObject(plan.blockedNavigation) ? plan.blockedNavigation : {};
  if (bn.anyAllowed === true) blockers.push('unsafe_navigation_allowed');

  // Prototype relink prohibition.
  const pr = isGenericModelPlainObject(plan.prototypeRelinkProhibition) ? plan.prototypeRelinkProhibition : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('unsafe_prototype_relink');

  // Manual gate must be present.
  const mg = isGenericModelPlainObject(plan.manualGate) ? plan.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesRoute === true || mg.authorizesMenu === true) blockers.push('unsafe_manual_gate_authorizes_route_menu');

  const ok = blockers.length === 0;
  const core = {
    kind: 'route-menu-implementation-plan-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    planOnly: caps.planOnly === true,
    routeImplemented: caps.routeImplemented === true,
    menuImplemented: caps.menuImplemented === true,
    runtimeUiMounted: caps.runtimeUiMounted === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: routeMenuPlanDigest(core) });
}

export default verifyRouteMenuImplementationPlan;
