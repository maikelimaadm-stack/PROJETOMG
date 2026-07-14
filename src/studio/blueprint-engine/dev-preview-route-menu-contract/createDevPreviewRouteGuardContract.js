import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Route guard CONTRACT — default-deny, fail-closed, dev-only; production/staging denied; tenant
 * and permission context synthetic only. Pure and deterministic.
 * @returns {Object}
 */
export function createDevPreviewRouteGuardContract() {
  const core = {
    kind: 'dev-preview-route-guard-contract',
    defaultDeny: true,
    failClosed: true,
    devOnlyRequired: true,
    productionDenied: true,
    stagingDenied: true,
    tenantContextSyntheticOnly: true,
    permissionContextSyntheticOnly: true,
  };
  return safeCloneGenericModel({ ...core, routeGuardDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteGuardContract;
