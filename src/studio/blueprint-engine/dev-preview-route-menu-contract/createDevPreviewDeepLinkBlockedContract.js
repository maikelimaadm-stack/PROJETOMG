import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Deep-link blocked CONTRACT — no deep link created or allowed; no external link; no browser
 * navigation. Pure and deterministic.
 * @returns {Object}
 */
export function createDevPreviewDeepLinkBlockedContract() {
  const core = {
    kind: 'dev-preview-deep-link-blocked-contract',
    deepLinkCreated: false,
    deepLinkAllowed: false,
    externalLinkAllowed: false,
    browserNavigationAllowed: false,
    reason: 'future explicit route/menu implementation slice required',
  };
  return safeCloneGenericModel({ ...core, deepLinkBlockedDigest: routeMenuDigest(core) });
}

export default createDevPreviewDeepLinkBlockedContract;
