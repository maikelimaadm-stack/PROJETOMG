import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Emits ROUTE PLAN metadata for the future visual preview — entirely as a blocked plan. Pure,
 * metadata-only. Registers NO route, mounts NO router, touches NO App. Consuming this changes
 * nothing in the running app.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] a dev preview contract bridge
 * @returns {Object} route plan metadata (blocked)
 */
export function createDevPreviewVisualRoutePlanMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.bridge?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-visual-route-plan-metadata',
    moduleId,
    futureRoutePlan: `/studio/preview/visual/${moduleId}`,
    plannedGuards: ['tenant', 'permission', 'feature-flag'],
    routeCreated: false,
    routerMounted: false,
    appTouched: false,
    navigationTouched: false,
    exposedInApp: false,
    blockedNow: true,
    reason: 'requires future approved dev preview runtime slice',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, routePlanDigest: visualDigest(core) });
}

export default createDevPreviewVisualRoutePlanMetadata;
