import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Route descriptor CONTRACT — metadata only. `futurePath` is metadata and must never be registered
 * in a real router. No route created, no component mounted, no App/router registration. Pure and
 * deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUi]
 * @returns {Object}
 */
export function createDevPreviewRouteDescriptorContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ui = isGenericModelPlainObject(o.runtimeUi) ? o.runtimeUi : {};
  const moduleId = String(ui.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-route-descriptor-contract',
    routeId: `dev-preview-${moduleId}`,
    futurePath: `/__dev/studio-preview/${moduleId}`,
    futureRouteName: `studioDevPreview_${moduleId}`,
    futurePageKind: 'studio_dev_preview_isolated_ui',
    futureEntryContract: 'studio-dev-preview-runtime-ui@1.0.0',
    devOnly: true,
    isolated: true,
    routeCreated: false,
    componentMounted: false,
    appRegistered: false,
    routerRegistered: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, routeDescriptorDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteDescriptorContract;
