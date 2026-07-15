import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { BLOCKED_NAVIGATION_KINDS, routeMenuDigest } from './routeMenuConfig.js';

/**
 * The blocked navigation model. Every product/global navigation action is permanently blocked.
 * Pure and deterministic.
 * @returns {Object}
 */
export function createBlockedNavigationModel() {
  const actions = BLOCKED_NAVIGATION_KINDS.map((action) => ({ action, blocked: true, allowed: false }));
  const core = {
    kind: 'route-menu-blocked-navigation-model',
    blockedNavigationKinds: [...BLOCKED_NAVIGATION_KINDS],
    actions,
    actionCount: actions.length,
    allBlocked: actions.every((a) => a.blocked === true),
    anyAllowed: actions.some((a) => a.allowed === true),
  };
  return safeCloneGenericModel({ ...core, blockedNavigationDigest: routeMenuDigest(core) });
}

export default createBlockedNavigationModel;
