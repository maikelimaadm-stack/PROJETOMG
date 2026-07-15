import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { isProductionOrStaging, routeMenuDigest } from './routeMenuConfig.js';

/**
 * Route guard — default-deny, fail-closed. Access is granted ONLY when the dev feature gate is
 * open, synthetic data is required/present, and the environment is not production/staging. Pure —
 * returns a report; never throws.
 *
 * @param {Object} [options]
 * @param {Object} [options.featureGate]
 * @param {string} [options.environment]
 * @param {boolean} [options.syntheticData]
 * @returns {Object}
 */
export function createRouteGuard(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const gate = isGenericModelPlainObject(o.featureGate) ? o.featureGate : {};
  const environment = String(o.environment ?? 'unknown');
  const synthetic = o.syntheticData !== false;
  const prodOrStaging = isProductionOrStaging(environment);

  const allow = gate.open === true && synthetic && !prodOrStaging;
  const core = {
    kind: 'route-menu-route-guard',
    allow,
    defaultDeny: true,
    failClosed: true,
    devOnlyRequired: true,
    featureFlagRequired: true,
    syntheticDataRequired: true,
    productionDenied: true,
    stagingDenied: true,
    featureGateOpen: gate.open === true,
    productionOrStagingDetected: prodOrStaging,
  };
  return safeCloneGenericModel({ ...core, routeGuardDigest: routeMenuDigest(core) });
}

export default createRouteGuard;
