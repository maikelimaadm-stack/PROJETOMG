import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { APP_INTEGRATION_CONTRACT_CAPABILITIES, appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Verifies a produced App integration contract for headless / contract-only / metadata-only safety
 * invariants. Pure — returns a report; never throws, never mutates, never performs I/O. Any violated
 * invariant is a blocker.
 *
 * Detects: appIntegrated/appTouched true, App/router/menu/sidebar wiring, route/menu exposure,
 * Runtime UI mounted in App, feature flag connected to App, ReactDOM/createRoot/window/document
 * usage, router primitives, public deep-link, backend/Prisma, fetch/storage, production/staging,
 * real data read/write, prototype relink, missing manual gate, and forbidden-flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.contract]
 * @returns {Object}
 */
export function verifyAppIntegrationContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : APP_INTEGRATION_CONTRACT_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'appIntegrated', 'appTouched', 'appWiringCreated', 'routerTouched', 'routerWiringCreated',
    'routeExposedToProduct', 'menuExposedToProduct', 'sidebarExposedToProduct', 'runtimeUiMountedInApp',
    'featureFlagConnectedToApp', 'reactDomUsed', 'createRootUsed', 'windowUsed', 'documentUsed',
    'deepLinkCreated', 'moduleGenerated', 'filesWrittenToModule', 'moduleRegistered', 'backendAccessed',
    'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed',
    'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = ['headless', 'contractOnly', 'metadataOnly', 'appIntegrationContractOnly', 'devOnly', 'isolated'];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }
  if (contract.metadataOnly === false) blockers.push('contract_must_be_metadata_only');

  // Attachment point.
  const ap = isGenericModelPlainObject(contract.attachmentPoint) ? contract.attachmentPoint : {};
  if (ap.appTouched === true) blockers.push('unsafe_app_touched');
  if (ap.attachmentCreated === true || ap.integrationPerformed === true) blockers.push('unsafe_attachment_created');

  // Feature flag.
  const ff = isGenericModelPlainObject(contract.featureFlag) ? contract.featureFlag : {};
  if (ff.connectedToApp === true) blockers.push('unsafe_feature_flag_connected_to_app');
  if (ff.defaultEnabled === true) blockers.push('unsafe_feature_flag_default_enabled');

  // Bootstrap boundary.
  const bb = isGenericModelPlainObject(contract.bootstrapBoundary) ? contract.bootstrapBoundary : {};
  if (bb.bootstrapTouched === true || bb.bootstrapIntegrationCreated === true) blockers.push('unsafe_bootstrap_touched');
  if (bb.autoMountAllowed === true || bb.mountOnImportAllowed === true || bb.sideEffectOnImportAllowed === true) blockers.push('unsafe_auto_mount');

  // Router attachment.
  const ra = isGenericModelPlainObject(contract.routerAttachment) ? contract.routerAttachment : {};
  if (ra.routerTouched === true || ra.routerAttachmentCreated === true || ra.routeRegistered === true) blockers.push('unsafe_router_wired');
  if (ra.browserRouterUsed === true || ra.createBrowserRouterUsed === true || ra.useNavigateUsed === true) blockers.push('unsafe_router_api');

  // Route/menu exposure.
  const re = isGenericModelPlainObject(contract.routeExposure) ? contract.routeExposure : {};
  if (re.routeExposedToProduct === true || re.publicRouteCreated === true) blockers.push('unsafe_route_exposed');
  if (re.deepLinkCreated === true || re.browserNavigationAllowed === true) blockers.push('unsafe_deep_link');
  const me = isGenericModelPlainObject(contract.menuExposure) ? contract.menuExposure : {};
  if (me.menuExposedToProduct === true || me.sidebarExposedToProduct === true || me.menuItemCreated === true) blockers.push('unsafe_menu_exposed');

  // Runtime UI mount adapter.
  const ma = isGenericModelPlainObject(contract.runtimeUiMountAdapter) ? contract.runtimeUiMountAdapter : {};
  if (ma.runtimeUiMountedInApp === true || ma.mountAdapterCreated === true) blockers.push('unsafe_runtime_ui_mounted');
  if (ma.reactDomUsed === true || ma.createRootUsed === true) blockers.push('unsafe_react_dom');
  if (ma.windowUsed === true || ma.documentUsed === true) blockers.push('unsafe_dom_globals');

  // Production/staging denial.
  const pd = isGenericModelPlainObject(contract.productionStagingDenial) ? contract.productionStagingDenial : {};
  if (pd.productionDenied === false || pd.stagingDenied === false) blockers.push('unsafe_production_staging_allowed');

  // Prototype relink prohibition.
  const pr = isGenericModelPlainObject(contract.prototypeRelinkProhibition) ? contract.prototypeRelinkProhibition : {};
  if (pr.prototypeRelinkAllowed === true || pr.oldPrototypeImported === true) blockers.push('unsafe_prototype_relink');

  // Manual gate must be present and authorize nothing real.
  const mg = isGenericModelPlainObject(contract.manualGate) ? contract.manualGate : {};
  if (mg.manualGateRequired !== true) blockers.push('missing_manual_gate');
  if (mg.authorizesAppWiring === true || mg.authorizesRuntimeUiMount === true) blockers.push('unsafe_manual_gate_authorizes_integration');

  const ok = blockers.length === 0;
  const core = {
    kind: 'app-integration-contract-verification',
    ok,
    valid: ok,
    headless: caps.headless === true,
    contractOnly: caps.contractOnly === true,
    metadataOnly: caps.metadataOnly === true,
    appIntegrated: caps.appIntegrated === true,
    appTouched: caps.appTouched === true,
    runtimeUiMountedInApp: caps.runtimeUiMountedInApp === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: appIntegrationDigest(core) });
}

export default verifyAppIntegrationContract;
