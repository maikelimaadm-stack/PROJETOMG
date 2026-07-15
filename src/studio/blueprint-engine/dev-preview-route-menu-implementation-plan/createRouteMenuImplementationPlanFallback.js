import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_IMPLEMENTATION_PLAN_NAME,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_MODE,
  ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES,
  routeMenuPlanDigest,
} from './routeMenuImplementationPlanConfig.js';

/**
 * Builds a safe, fail-closed fallback for an invalid/missing/fallback route/menu contract. Never
 * throws; authorizes nothing. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object}
 */
export function createRouteMenuImplementationPlanFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_route_menu_contract';

  const core = {
    kind: 'studio-dev-preview-route-menu-implementation-plan',
    routeMenuImplementationPlanName: ROUTE_MENU_IMPLEMENTATION_PLAN_NAME,
    routeMenuImplementationPlanVersion: ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
    mode: ROUTE_MENU_IMPLEMENTATION_PLAN_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForRouteMenuImplementationPlan: false,
    readyForRouteMenuImplementationSlice: false,
    readyForAppIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['invalid_or_missing_route_menu_contract'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...ROUTE_MENU_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, overallDigest: routeMenuPlanDigest(core) });
}

export default createRouteMenuImplementationPlanFallback;
