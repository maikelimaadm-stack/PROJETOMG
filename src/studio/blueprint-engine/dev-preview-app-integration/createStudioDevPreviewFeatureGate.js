import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  STUDIO_DEV_PREVIEW_ROUTE_FLAG,
  STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG,
  REQUIRED_CHECKPOINT_RECEIPT,
  isProductionOrStaging,
  isDevelopmentEnvironment,
  appIntegrationDigest,
} from './appIntegrationConfig.js';

/**
 * The dev-only feature gate for the App integration. Default CLOSED. It opens ONLY when, with strict
 * equality: the environment is development (never production/staging), the opt-in flag is exactly
 * `'true'`, and the checkpoint receipt flag equals the required value. Pure — returns a report; reads
 * only the provided env; never throws, never mutates.
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object}
 */
export function createStudioDevPreviewFeatureGate(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const env = isGenericModelPlainObject(o.env) ? o.env : {};

  const prodOrStaging = isProductionOrStaging(env);
  const dev = isDevelopmentEnvironment(env);
  const flagOn = env[STUDIO_DEV_PREVIEW_ROUTE_FLAG] === 'true';
  const checkpointApproved = env[STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG] === REQUIRED_CHECKPOINT_RECEIPT;
  const open = dev && !prodOrStaging && flagOn && checkpointApproved;

  let reason = 'open';
  if (prodOrStaging) reason = 'production_or_staging_denied';
  else if (!dev) reason = 'not_development_environment';
  else if (!flagOn) reason = 'flag_off_or_missing';
  else if (!checkpointApproved) reason = 'checkpoint_missing_or_invalid';

  const core = {
    kind: 'app-integration-feature-gate',
    devOnly: true,
    defaultEnabled: false,
    open,
    reason,
    flagName: STUDIO_DEV_PREVIEW_ROUTE_FLAG,
    checkpointFlagName: STUDIO_DEV_PREVIEW_CHECKPOINT_FLAG,
    productionAllowed: false,
    stagingAllowed: false,
    productionDenied: true,
    stagingDenied: true,
    failClosed: true,
    runtimeVerified: true,
  };
  return safeCloneGenericModel({ ...core, featureGateDigest: appIntegrationDigest(core) });
}

export default createStudioDevPreviewFeatureGate;
