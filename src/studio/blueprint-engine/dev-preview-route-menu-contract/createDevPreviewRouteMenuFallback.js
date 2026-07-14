import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_CONTRACT_NAME,
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_CONTRACT_MODE,
  ROUTE_MENU_CONTRACT_CAPABILITIES,
  routeMenuDigest,
} from './routeMenuContractConfig.js';

/**
 * Builds a safe, fail-closed fallback for an invalid/missing/fallback runtime UI. Never throws;
 * authorizes nothing. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object}
 */
export function createDevPreviewRouteMenuFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_runtime_ui';

  const core = {
    kind: 'studio-dev-preview-route-menu-contract',
    routeMenuContractName: ROUTE_MENU_CONTRACT_NAME,
    routeMenuContractVersion: ROUTE_MENU_CONTRACT_VERSION,
    mode: ROUTE_MENU_CONTRACT_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForRouteMenuContract: false,
    readyForRouteMenuImplementation: false,
    readyForAppIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['invalid_or_missing_runtime_ui'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...ROUTE_MENU_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, overallDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteMenuFallback;
