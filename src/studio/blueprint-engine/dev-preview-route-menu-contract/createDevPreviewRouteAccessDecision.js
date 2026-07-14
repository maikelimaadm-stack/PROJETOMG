import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest, isProductionEnv } from './routeMenuContractConfig.js';

/**
 * Route access decision CONTRACT — always denies access now (contract-only); fails closed in
 * production/staging. Pure and deterministic.
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object}
 */
export function createDevPreviewRouteAccessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const env = isGenericModelPlainObject(o.env) ? o.env : {};
  const production = isProductionEnv(env);

  const core = {
    kind: 'dev-preview-route-access-decision',
    accessGrantedNow: false,
    decision: 'deny_contract_only',
    devOnly: true,
    productionDetected: production,
    failClosed: true,
    reason: 'route access is contract-only; a future explicit slice is required',
  };
  return safeCloneGenericModel({ ...core, routeAccessDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteAccessDecision;
