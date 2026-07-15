import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Deep-link policy PLAN — metadata only; nothing implemented or allowed. Pure and deterministic.
 * @returns {Object}
 */
export function createDeepLinkPolicyPlan() {
  const core = {
    kind: 'route-menu-deep-link-policy-plan',
    deepLinkImplemented: false,
    deepLinkAllowed: false,
    browserNavigationAllowed: false,
    externalLinkAllowed: false,
    reason: 'future explicit route/menu implementation slice required',
  };
  return safeCloneGenericModel({ ...core, deepLinkPolicyDigest: routeMenuPlanDigest(core) });
}

export default createDeepLinkPolicyPlan;
