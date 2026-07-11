import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
  MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG,
  MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG,
  detectFuelDevEnvLabel,
  isModeloBase2FuelDevPreviewRouteEnabled,
  shouldMountModeloBase2FuelDevPreviewRoute,
} from './modeloBase2FuelDevPreviewConfig.js';

/**
 * Resolves ACCESS to the dev-only fuel preview route. Pure; never mutates input.
 * Fails closed: off by default; in production it is denied unless the explicit
 * `*_ALLOW_PROD` override is set (which raises a high-visibility warning).
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object} access descriptor
 */
export function resolveModeloBase2FuelDevPreviewAccess(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const env = isGenericModelPlainObject(o.env) ? o.env : {};
  const environment = detectFuelDevEnvLabel(env);
  const flagOn = env[MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG] === 'true';
  const allowProd = env[MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG] === 'true';
  const enabled = isModeloBase2FuelDevPreviewRouteEnabled(env);
  const shouldMount = shouldMountModeloBase2FuelDevPreviewRoute(env);
  const allowed = enabled && shouldMount;

  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];
  let reason = 'allowed';
  if (!flagOn) { reason = 'flag-off'; blockers.push('route flag off'); }
  else if (environment === 'production' && !allowProd) { reason = 'production-fail-closed'; blockers.push('production without ALLOW_PROD'); }
  else if (environment === 'production' && allowProd) { reason = 'production-allowed-override'; warnings.push('DEV PREVIEW ROUTE ENABLED IN PRODUCTION via explicit override — remove before release'); }
  else if (!allowed) { reason = 'not-mountable'; }

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-dev-preview-access',
    allowed,
    reason,
    routePath: MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH,
    devOnly: true,
    allowProd,
    environment,
    flags: {
      route: MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_FLAG,
      allowProd: MODELOBASE2_FUEL_DEV_PREVIEW_ALLOW_PROD_FLAG,
      routeOn: flagOn,
    },
    // The route mounts ONLY when allowed; it never registers into the menu.
    uiMountedInApp: allowed,
    routeRegistered: allowed,
    menuRegistered: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistenceReal: false,
    localOnly: true,
    sent: false,
    warnings,
    blockers,
  });
}

export default resolveModeloBase2FuelDevPreviewAccess;
