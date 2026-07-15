import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { BLOCKED_NAVIGATION_KINDS, routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Blocked navigation action PLAN — every action permanently blocked (metadata only). Pure and
 * deterministic.
 * @returns {Object}
 */
export function createBlockedNavigationActionPlan() {
  const actions = BLOCKED_NAVIGATION_KINDS.map((action) => ({
    action,
    blocked: true,
    allowed: false,
  }));
  const core = {
    kind: 'route-menu-blocked-navigation-action-plan',
    blockedNavigationKinds: [...BLOCKED_NAVIGATION_KINDS],
    actions,
    actionCount: actions.length,
    allBlocked: actions.every((a) => a.blocked === true),
    anyAllowed: actions.some((a) => a.allowed === true),
  };
  return safeCloneGenericModel({ ...core, blockedNavigationDigest: routeMenuPlanDigest(core) });
}

export default createBlockedNavigationActionPlan;
