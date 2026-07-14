import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Emits ROUTE-runtime plan metadata for the future shell — entirely as a blocked plan. Pure,
 * metadata-only. Registers NO route, mounts NO router, touches NO App. Consuming this changes
 * nothing in the running app.
 *
 * @param {Object} [options]
 * @returns {Object} route blocked metadata
 */
export function createDevPreviewRuntimeShellRouteBlockedMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.visualContract?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-runtime-shell-route-blocked-metadata',
    moduleId,
    futureRouteRuntime: `/studio/preview/runtime/${moduleId}`,
    routeCreated: false,
    routerMounted: false,
    appTouched: false,
    navigationTouched: false,
    exposedInApp: false,
    blockedNow: true,
    reason: 'requires future approved runtime implementation slice',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, routeBlockedDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellRouteBlockedMetadata;
