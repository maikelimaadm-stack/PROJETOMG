import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { BLOCKED_NAVIGATION_KINDS, routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Navigation boundary CONTRACT — blocks navigate/openRoute/deepLink/registerRoute/registerMenu/
 * registerSidebarItem/registerModule. Metadata only. Pure and deterministic.
 * @returns {Object}
 */
export function createDevPreviewNavigationBoundaryContract() {
  const actions = BLOCKED_NAVIGATION_KINDS.map((action) => ({
    action,
    blocked: true,
    allowed: false,
  }));
  const core = {
    kind: 'dev-preview-navigation-boundary-contract',
    blockedNavigationKinds: [...BLOCKED_NAVIGATION_KINDS],
    actions,
    actionCount: actions.length,
    allBlocked: actions.every((a) => a.blocked === true),
    anyAllowed: actions.some((a) => a.allowed === true),
  };
  return safeCloneGenericModel({ ...core, navigationBoundaryDigest: routeMenuDigest(core) });
}

export default createDevPreviewNavigationBoundaryContract;
