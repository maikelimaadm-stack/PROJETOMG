import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_NAME,
  APP_INTEGRATION_VERSION,
  APP_INTEGRATION_MODE,
  APP_INTEGRATION_CAPABILITIES,
  appIntegrationDigest,
} from './appIntegrationConfig.js';

/**
 * Builds a safe, fail-closed fallback for an invalid/missing/fallback route-menu runtime. Never
 * throws; authorizes nothing. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object}
 */
export function createAppIntegrationFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_route_menu_runtime';

  const core = {
    kind: 'studio-dev-preview-app-integration',
    appIntegrationName: APP_INTEGRATION_NAME,
    appIntegrationVersion: APP_INTEGRATION_VERSION,
    mode: APP_INTEGRATION_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForAppIntegration: false,
    readyForProductExposure: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['invalid_or_missing_route_menu_runtime'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...APP_INTEGRATION_CAPABILITIES },
  };
  return safeCloneGenericModel({ ...core, overallDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationFallback;
