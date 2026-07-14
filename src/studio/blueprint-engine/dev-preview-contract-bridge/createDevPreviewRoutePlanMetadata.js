import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Emits ROUTE PLAN metadata describing where a module WOULD live — entirely as a blocked
 * plan. Pure, metadata-only. It registers NO route, mounts NO router, and is explicitly
 * marked blocked/not-wired. Consuming this changes nothing in the running app.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox]
 * @returns {Object} route plan metadata (blocked)
 */
export function createDevPreviewRoutePlanMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.sandbox?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-route-plan-metadata',
    moduleId,
    plannedPath: `/studio/preview/${moduleId}`,
    plannedGuards: ['tenant', 'permission', 'feature-flag'],
    wired: false,
    routeCreated: false,
    routerMounted: false,
    exposedInApp: false,
    blocked: true,
    blockedReason: 'dev_preview_contract_bridge_is_headless',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, routePlanDigest: bridgeDigest(core) });
}

export default createDevPreviewRoutePlanMetadata;
