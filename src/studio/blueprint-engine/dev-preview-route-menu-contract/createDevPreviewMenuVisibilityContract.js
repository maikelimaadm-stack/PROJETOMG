import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Menu visibility CONTRACT — not visible now; future visibility is contract-only. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createDevPreviewMenuVisibilityContract() {
  const core = {
    kind: 'dev-preview-menu-visibility-contract',
    visibleNow: false,
    visibleInDevMenuNow: false,
    visibleInProductNow: false,
    futureVisibility: 'contract_only',
  };
  return safeCloneGenericModel({ ...core, menuVisibilityDigest: routeMenuDigest(core) });
}

export default createDevPreviewMenuVisibilityContract;
