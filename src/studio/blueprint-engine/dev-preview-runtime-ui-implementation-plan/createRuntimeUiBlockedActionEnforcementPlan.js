import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { BLOCKED_ACTION_KINDS, uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans the blocked-action enforcement. Every action is permanently blocked (metadata only).
 * Pure and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiBlockedActionEnforcementPlan() {
  const actions = BLOCKED_ACTION_KINDS.map((action) => ({
    action,
    blocked: true,
    allowed: false,
    reason: 'permanently blocked in headless plan; future slice needs enterprise checkpoint',
  }));
  const core = {
    kind: 'runtime-ui-blocked-action-enforcement-plan',
    blockedActionKinds: [...BLOCKED_ACTION_KINDS],
    actions,
    actionCount: actions.length,
    allBlocked: actions.every((a) => a.blocked === true),
    anyAllowed: actions.some((a) => a.allowed === true),
    enforcementImplemented: false,
  };
  return safeCloneGenericModel({ ...core, blockedActionPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiBlockedActionEnforcementPlan;
