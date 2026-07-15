import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES, appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Verifies a produced App integration implementation plan for headless / plan-only safety
 * invariants. Pure — returns a report; never throws, never mutates, never performs I/O. Any violated
 * invariant is a blocker.
 *
 * Detects: appIntegrated/appTouched true, App/router/menu/sidebar wiring, productionUiGuard
 * extension, feature flag implemented/connected, route/menu exposure, Runtime UI mounted in App,
 * ReactDOM/createRoot/window/document usage, router primitives, public deep-link, backend/Prisma,
 * fetch/storage, production/staging, real data read/write, prototype relink, missing manual gate,
 * and forbidden-flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.plan]
 * @returns {Object}
 */
export function verifyAppIntegrationImplementationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.plan) ? o.plan : {};
  const caps = isGenericModelPlainObject(plan.capabilities) ? plan.capabilities : APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'appIntegrated', 'appTouched', 'appWiringImplemented', 'productionUiGuardExtended',
    'featureFlagImplemented', 'featureFlagConnectedToApp', 'routerWiringImplemented',
    'routeExposedToProduct', 'menuExposedToProduct', 'sidebarExposedToProduct', 'runtimeUiMountedInApp',
    'reactDomUsed', 'createRootUsed', 'windowUsed', 'documentUsed', 'deepLinkCreated', 'moduleGenerated',
    'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed',
    'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead',
    'realDataWrite', 'rewriteEmpresas', 'oldPrototypeImported',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly', 'metadataOnly', 'planOnly'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (plan.metadataOnly === false) blockers.push('plan_must_be_metadata_only');

  // App touch boundary.
  const at = isGenericModelPlainObject(plan.appTouchBoundary) ? plan.appTouchBoundary : {};
  if (at.appTouched === true) blockers.push('unsafe_app_touched');
  if (at.appWiringImplemented === true) blockers.push('unsafe_app_wiring_implemented');

  // productionUiGuard extension.
  const pg = isGenericModelPlainObject(plan.productionUiGuardExtension) ? plan.productionUiGuardExtension : {};
  if (pg.productionUiGuardExtended === true || pg.productionUiGuardTouched === true || pg.extensionImplemented === true) blockers.push('unsafe_production_ui_guard_extended');

  // Feature flag.
  const ff = isGenericModelPlainObject(plan.featureFlag) ? plan.featureFlag : {};
  if (ff.featureFlagImplemented === true) blockers.push('unsafe_feature_flag_implemented');
  if (ff.featureFlagConnectedToApp === true) blockers.push('unsafe_feature_flag_connected_to_app');

  // Router exposure.
  const re = isGenericModelPlainObject(plan.routerExposure) ? plan.routerExposure : {};
  if (re.routerWiringImplemented === true || re.routeExposedToProduct === true) blockers.push('unsafe_router_wired');
  if (re.routeElementCreated === true || re.routesElementCreated === true) blockers.push('unsafe_router_primitive');
  if (re.browserRouterUsed === true || re.createBrowserRouterUsed === true || re.useNavigateUsed === true) blockers.push('unsafe_router_api');

  // Menu/sidebar exposure.
  const me = isGenericModelPlainObject(plan.menuSidebarExposure) ? plan.menuSidebarExposure : {};
  if (me.menuExposedToProduct === true || me.sidebarExposedToProduct === true || me.menuItemCreated === true) blockers.push('unsafe_menu_exposed');

  // Runtime UI mount.
  const mb = isGenericModelPlainObject(plan.runtimeUiMount) ? plan.runtimeUiMount : {};
  if (mb.runtimeUiMountedInApp === true || mb.mountImplemented === true) blockers.push('unsafe_runtime_ui_mounted');
  if (mb.reactDomUsed === true || mb.createRootUsed === true) blockers.push('unsafe_react_dom');
  if (mb.windowApiUsed === true || mb.documentApiUsed === true) blockers.push('unsafe_dom_globals');

  // Production/staging fail-closed.
  const pd = isGenericModelPlainObject(plan.productionStagingFailClosed) ? plan.productionStagingFailClosed : {};
  if (pd.productionDenied === false || pd.stagingDenied === false) blockers.push('unsafe_production_staging_allowed');

  // Prototype relink static assertion.
  const pr = isGenericModelPlainObject(plan.prototypeRelinkStaticAssertion) ? plan.prototypeRelinkStaticAssertion : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('unsafe_prototype_relink');

  // Governance registry plan.
  const gr = isGenericModelPlainObject(plan.governanceRegistry) ? plan.governanceRegistry : {};
  if (gr.registryTouched === true || gr.guardTouched === true || gr.broadWildcardAllowed === true) blockers.push('unsafe_governance_registry');

  // Manual gate must be present and authorize nothing real.
  const mg = isGenericModelPlainObject(plan.manualGate) ? plan.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesAppWiring === true || mg.authorizesRuntimeUiMount === true || mg.authorizesProductionUiGuardExtension === true) blockers.push('unsafe_manual_gate_authorizes_integration');

  const ok = blockers.length === 0;
  const core = {
    kind: 'app-integration-implementation-plan-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    planOnly: caps.planOnly === true,
    appIntegrated: caps.appIntegrated === true,
    appTouched: caps.appTouched === true,
    productionUiGuardExtended: caps.productionUiGuardExtended === true,
    runtimeUiMountedInApp: caps.runtimeUiMountedInApp === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: appIntegrationPlanDigest(core) });
}

export default verifyAppIntegrationImplementationPlan;
