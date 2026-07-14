import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Route visibility CONTRACT — not visible now anywhere; future visibility is contract-only. Pure
 * and deterministic.
 * @returns {Object}
 */
export function createDevPreviewRouteVisibilityContract() {
  const core = {
    kind: 'dev-preview-route-visibility-contract',
    visibleNow: false,
    visibleInDevMenuNow: false,
    visibleInProductNow: false,
    futureVisibility: 'contract_only',
  };
  return safeCloneGenericModel({ ...core, routeVisibilityDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteVisibilityContract;
