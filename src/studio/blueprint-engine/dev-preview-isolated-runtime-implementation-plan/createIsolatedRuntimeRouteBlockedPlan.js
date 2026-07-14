import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Emits ROUTE-runtime plan metadata for the future isolated runtime — entirely as a blocked
 * plan. Pure, metadata-only. Registers NO route, mounts NO router, touches NO App.
 *
 * @param {Object} [options]
 * @returns {Object} route blocked plan
 */
export function createIsolatedRuntimeRouteBlockedPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.runtimeShellContract?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'isolated-runtime-route-blocked-plan',
    moduleId,
    futureRouteRuntime: `/studio/preview/isolated-runtime/${moduleId}`,
    routeCreated: false,
    routerMounted: false,
    appTouched: false,
    navigationTouched: false,
    exposedInApp: false,
    blockedNow: true,
    reason: 'requires future approved isolated runtime implementation slice',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, routeBlockedDigest: planDigest(core) });
}

export default createIsolatedRuntimeRouteBlockedPlan;
