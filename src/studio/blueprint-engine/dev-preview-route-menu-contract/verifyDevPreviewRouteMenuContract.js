import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_CONTRACT_CAPABILITIES, routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Verifies a produced route/menu contract for headless / contract-only safety invariants. Pure —
 * returns a report; never throws, never mutates, never performs I/O. Any violated invariant is a
 * blocker.
 *
 * Detects: routeCreated/menuCreated true, App/router/navigation/sidebar wiring, Route/Routes/
 * NavLink/Link, BrowserRouter/createBrowserRouter/useNavigate, deepLinkCreated true, production/
 * staging, backend/Prisma, fetch/storage, real mutation/navigation, real data read/write,
 * prototype relink, missing manual gate, and forbidden-flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.contract]
 * @returns {Object}
 */
export function verifyDevPreviewRouteMenuContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : ROUTE_MENU_CONTRACT_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'routeCreated', 'menuCreated', 'appWiringCreated', 'routerWiringCreated', 'navigationWiringCreated',
    'sidebarWiringCreated', 'deepLinkCreated', 'linkCreated', 'navLinkCreated', 'moduleGenerated',
    'filesWrittenToModule', 'moduleRegistered', 'backendAccessed', 'prismaAccessed',
    'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed', 'persistenceCreated',
    'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'oldPrototypeImported',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly', 'metadataOnly', 'devOnly', 'isolated'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (contract.metadataOnly === false) blockers.push('contract_must_be_metadata_only');

  // Route descriptor: never registered.
  const rd = isGenericModelPlainObject(contract.routeDescriptor) ? contract.routeDescriptor : {};
  if (rd.routeCreated === true) blockers.push('unsafe_route_created');
  if (rd.appRegistered === true) blockers.push('unsafe_app_registered');
  if (rd.routerRegistered === true) blockers.push('unsafe_router_registered');
  if (rd.componentMounted === true) blockers.push('unsafe_component_mounted');

  // Menu placement: never registered.
  const mp = isGenericModelPlainObject(contract.menuPlacement) ? contract.menuPlacement : {};
  if (mp.menuCreated === true) blockers.push('unsafe_menu_created');
  if (mp.menuItemRegistered === true) blockers.push('unsafe_menu_item_registered');
  if (mp.sidebarTouched === true) blockers.push('unsafe_sidebar_touched');
  if (mp.navigationTouched === true) blockers.push('unsafe_navigation_touched');

  // Navigation boundary: nothing allowed.
  const nb = isGenericModelPlainObject(contract.navigationBoundary) ? contract.navigationBoundary : {};
  if (nb.anyAllowed === true) blockers.push('unsafe_navigation_allowed');

  // Deep-link blocked.
  const dl = isGenericModelPlainObject(contract.deepLinkBlocked) ? contract.deepLinkBlocked : {};
  if (dl.deepLinkCreated === true || dl.deepLinkAllowed === true) blockers.push('unsafe_deep_link');
  if (dl.browserNavigationAllowed === true) blockers.push('unsafe_browser_navigation');

  // App wiring blocked.
  const aw = isGenericModelPlainObject(contract.appWiringBlocked) ? contract.appWiringBlocked : {};
  if (aw.appTouched === true) blockers.push('unsafe_app_touched');
  if (aw.routerTouched === true) blockers.push('unsafe_router_touched');
  if (aw.wiringAllowed === true) blockers.push('unsafe_wiring_allowed');

  // Route isolation: no prototype relink.
  const ri = isGenericModelPlainObject(contract.routeIsolation) ? contract.routeIsolation : {};
  if (ri.noPrototypeRelink === false) blockers.push('unsafe_prototype_relink');

  // Manual gate must be present.
  const mg = isGenericModelPlainObject(contract.manualGate) ? contract.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesRoute === true || mg.authorizesMenu === true) blockers.push('unsafe_manual_gate_authorizes_route_menu');

  const ok = blockers.length === 0;
  const core = {
    kind: 'dev-preview-route-menu-contract-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    contractOnly: caps.contractOnly === true,
    routeCreated: caps.routeCreated === true,
    menuCreated: caps.menuCreated === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: routeMenuDigest(core) });
}

export default verifyDevPreviewRouteMenuContract;
