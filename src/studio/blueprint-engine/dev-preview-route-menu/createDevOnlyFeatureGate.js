import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_CHECKPOINT_RECEIPT, isDevelopmentEnvironment, isProductionOrStaging, routeMenuDigest } from './routeMenuConfig.js';

/**
 * The dev-only feature gate. Default is CLOSED. It opens ONLY when `enabled === true`, the
 * environment is exactly `development`, and the checkpoint receipt equals the required token. Pure —
 * returns a report; never throws, never reads env globals.
 *
 * @param {Object} [options]
 * @param {boolean} [options.enabled]
 * @param {string} [options.environment]
 * @param {string} [options.checkpointReceipt]
 * @returns {Object}
 */
export function createDevOnlyFeatureGate(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const enabled = o.enabled === true;
  const environment = String(o.environment ?? 'unknown');
  const checkpointApproved = o.checkpointReceipt === REQUIRED_CHECKPOINT_RECEIPT;
  const dev = isDevelopmentEnvironment(environment);
  const prodOrStaging = isProductionOrStaging(environment);

  const open = enabled && dev && checkpointApproved && !prodOrStaging;
  const core = {
    kind: 'route-menu-dev-only-feature-gate',
    open,
    enabledRequested: enabled,
    featureFlagDefaultEnabled: false,
    environment,
    isDevelopment: dev,
    productionDenied: true,
    stagingDenied: true,
    productionOrStagingDetected: prodOrStaging,
    checkpointApproved,
    failsClosed: true,
  };
  return safeCloneGenericModel({ ...core, featureGateDigest: routeMenuDigest(core) });
}

export default createDevOnlyFeatureGate;
