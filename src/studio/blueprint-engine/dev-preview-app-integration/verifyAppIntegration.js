import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { APP_INTEGRATION_CAPABILITIES, appIntegrationDigest } from './appIntegrationConfig.js';

/**
 * Verifies a produced App integration for dev-only / default-off / fail-closed / isolated safety
 * invariants. Pure — returns a report; never throws, never mutates, never performs I/O. Any violated
 * invariant is a blocker.
 *
 * Detects: product route/menu/sidebar exposure, public deep link, new router, eager import, preview
 * present in the production bundle, ReactDOM/createRoot/window/document usage, runtime UI mounted by
 * default, backend/Prisma, fetch/storage, production/staging, real data read/write, prototype relink,
 * and forbidden-flag inversion.
 *
 * @param {Object} [options]
 * @param {Object} [options.contract]
 * @returns {Object}
 */
export function verifyAppIntegration(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const contract = isGenericModelPlainObject(o.contract) ? o.contract : {};
  const caps = isGenericModelPlainObject(contract.capabilities) ? contract.capabilities : APP_INTEGRATION_CAPABILITIES;

  const blockers = [];
  const mustBeFalse = [
    'routerWiringImplemented', 'routeExposedToProduct', 'menuExposedToProduct', 'sidebarExposedToProduct',
    'runtimeUiMountedByDefault', 'eagerImportUsed', 'productionBundleContainsPreview', 'reactDomUsed',
    'createRootUsed', 'windowUsed', 'documentUsed', 'deepLinkPublic', 'moduleGenerated', 'backendAccessed',
    'prismaAccessed', 'productionAccessed', 'stagingAccessed', 'fetchUsed', 'mutationAllowed',
    'persistenceCreated', 'realDataRead', 'realDataWrite', 'rewriteEmpresas', 'prototypeRelinked',
  ];
  for (const k of mustBeFalse) {
    if (caps[k] === true) blockers.push(`capability_${k}_must_be_false`);
  }
  const mustBeTrue = [
    'devOnly', 'defaultOff', 'isolated', 'failClosed', 'syntheticDataOnly', 'appIntegrated', 'appTouched',
    'devRouteAttached', 'lazyImportUsed', 'runtimeUiMountedInApp', 'rollbackByFlagOff',
    'rollbackByRemovingAdditiveBlock',
  ];
  for (const k of mustBeTrue) {
    if (caps[k] !== true) blockers.push(`capability_${k}_must_be_true`);
  }

  // Feature gate must default off and deny production/staging.
  const fg = isGenericModelPlainObject(contract.featureGate) ? contract.featureGate : {};
  if (fg.defaultEnabled === true) blockers.push('unsafe_feature_gate_default_on');
  if (fg.productionAllowed === true || fg.stagingAllowed === true) blockers.push('unsafe_feature_gate_production_staging_allowed');

  // Attachment must be additive/dev-only and never expose product surfaces.
  const at = isGenericModelPlainObject(contract.appAttachment) ? contract.appAttachment : {};
  if (at.routeExposedToProduct === true || at.publicRoute === true) blockers.push('unsafe_route_exposed');
  if (at.menuExposedToProduct === true || at.sidebarExposedToProduct === true) blockers.push('unsafe_menu_sidebar_exposed');
  if (at.newRouterCreated === true || at.existingRouterRefactored === true) blockers.push('unsafe_router_change');
  if (at.providersTouched === true || at.authTouched === true || at.layoutTouched === true) blockers.push('unsafe_app_core_touched');

  // Lazy loader must not eager-import and must strip the preview from the production bundle.
  const ll = isGenericModelPlainObject(contract.lazyPreviewLoader) ? contract.lazyPreviewLoader : {};
  if (ll.eagerImportUsed === true) blockers.push('unsafe_eager_import');
  if (ll.productionBundleContainsPreview === true) blockers.push('unsafe_production_bundle_contains_preview');
  if (ll.mountsOnImport === true || ll.sideEffectOnImport === true) blockers.push('unsafe_mount_on_import');

  // Mount request must be explicit/injected and never global/dom.
  const mr = isGenericModelPlainObject(contract.mountRequest) ? contract.mountRequest : {};
  if (mr.globalRootUsed === true || mr.globalSingletonUsed === true || mr.serviceLocatorUsed === true) blockers.push('unsafe_global_mount');
  if (mr.reactDomUsed === true || mr.createRootUsed === true) blockers.push('unsafe_react_dom');
  if (mr.windowUsed === true || mr.documentUsed === true) blockers.push('unsafe_dom_globals');
  if (mr.runtimeUiMountedByDefault === true) blockers.push('unsafe_mount_by_default');

  const ok = blockers.length === 0;
  const core = {
    kind: 'app-integration-verification',
    ok,
    valid: ok,
    devOnly: caps.devOnly === true,
    defaultOff: caps.defaultOff === true,
    failClosed: caps.failClosed === true,
    appIntegrated: caps.appIntegrated === true,
    routeExposedToProduct: caps.routeExposedToProduct === true,
    productionBundleContainsPreview: caps.productionBundleContainsPreview === true,
    blockers,
    blockerCount: blockers.length,
    checkedCapabilities: mustBeFalse.length + mustBeTrue.length,
  };
  return safeCloneGenericModel({ ...core, verificationDigest: appIntegrationDigest(core) });
}

export default verifyAppIntegration;
