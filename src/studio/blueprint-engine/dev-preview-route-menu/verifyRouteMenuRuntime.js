import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_CAPABILITIES, routeMenuDigest } from './routeMenuConfig.js';

/**
 * Verifies a produced isolated route/menu runtime for dev-only / isolated / default-off / fail-
 * closed safety invariants. Pure — returns a report; never throws, never mutates, never performs
 * I/O.
 *
 * Detects: App/product-router/product-menu/sidebar wiring, browser route, public URL, deep link,
 * global mount, mount-by-default, feature-flag default-on, backend/Prisma, production/staging,
 * mutation/persistence, real data read/write, prototype relink, module generation, and forbidden-
 * flag inversion. Also detects unsafe part flags (react-router/react-dom/window/document/history/
 * location/auto-mount/root-factory-missing).
 *
 * @param {Object} [options]
 * @param {Object} [options.contract]
 * @returns {Object}
 */
export function verifyRouteMenuRuntime(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : ROUTE_MENU_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'runtimeUiMountedByDefault', 'globalRuntimeUiMounted', 'browserRouteRegistered',
    'productRouterWiringImplemented', 'productMenuRegistered', 'productSidebarRegistered',
    'appWiringImplemented', 'deepLinkImplemented', 'publicUrlCreated', 'routeCreatedInMainApp',
    'menuCreatedInMainApp', 'featureFlagDefaultEnabled', 'moduleGenerated', 'filesWrittenToModule',
    'moduleRegistered', 'backendAccessed', 'prismaAccessed', 'productionAccessed', 'stagingAccessed',
    'fetchUsed', 'mutationAllowed', 'persistenceCreated', 'realDataRead', 'realDataWrite',
    'rewriteEmpresas', 'prototypeRelinked',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['devOnly', 'isolated', 'defaultOff', 'failClosed', 'syntheticDataOnly', 'routeImplemented', 'menuImplemented', 'featureFlagRequired', 'productionDenied', 'stagingDenied'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }

  // Isolation boundary.
  const ib = isGenericModelPlainObject(contract.isolationBoundary) ? contract.isolationBoundary : {};
  if (ib.appJsxTouched === true) blockers.push('unsafe_app_touched');
  if (ib.mainRouterWired === true) blockers.push('unsafe_main_router_wired');
  if (ib.productMenuWired === true || ib.productSidebarWired === true) blockers.push('unsafe_product_menu_wired');
  if (ib.globalBrowserNavigation === true) blockers.push('unsafe_global_browser_navigation');
  if (ib.publicUrlCreated === true || ib.deepLinkImplemented === true) blockers.push('unsafe_public_deep_link');
  if (ib.reactRouterUsed === true) blockers.push('unsafe_react_router');
  if (ib.reactDomUsed === true || ib.internalCreateRootUsed === true) blockers.push('unsafe_react_dom');
  if (ib.windowUsed === true || ib.documentUsed === true || ib.historyUsed === true || ib.locationUsed === true) blockers.push('unsafe_browser_globals');
  if (ib.autoMountOnImport === true) blockers.push('unsafe_auto_mount');
  if (ib.oldPrototypeImported === true) blockers.push('unsafe_prototype_relink');

  // Feature gate must default off.
  const fg = isGenericModelPlainObject(contract.featureGate) ? contract.featureGate : {};
  if (fg.featureFlagDefaultEnabled === true) blockers.push('unsafe_feature_flag_default_on');

  // Mount request must never mount globally / by default.
  const mr = isGenericModelPlainObject(contract.mountRequest) ? contract.mountRequest : {};
  if (mr.globalRuntimeUiMounted === true) blockers.push('unsafe_global_mount');
  if (mr.mountedByDefault === true) blockers.push('unsafe_mount_by_default');

  // Checkpoint must be present.
  const cr = isGenericModelPlainObject(contract.checkpointReceipt) ? contract.checkpointReceipt : {};
  if (cr.approved !== true) blockers.push('missing_checkpoint');

  const ok = blockers.length === 0;
  const core = {
    kind: 'route-menu-runtime-verification',
    ok,
    valid: ok,
    devOnly: caps.devOnly === true,
    isolated: caps.isolated === true,
    defaultOff: caps.defaultOff === true,
    routeImplemented: caps.routeImplemented === true,
    menuImplemented: caps.menuImplemented === true,
    globalRuntimeUiMounted: caps.globalRuntimeUiMounted === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: routeMenuDigest(core) });
}

export default verifyRouteMenuRuntime;
