import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_BLOCKED_ACTION_KINDS, runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * The blocked-action model. Every action is permanently blocked; the UI shows a blocked banner
 * instead of enabling it. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createRuntimeUiBlockedActionModel() {
  const actions = RUNTIME_UI_BLOCKED_ACTION_KINDS.map((action) => ({
    action,
    blocked: true,
    allowed: false,
    surface: 'RuntimeUiBlockedActionBanner',
  }));
  const core = {
    kind: 'runtime-ui-blocked-action-model',
    blockedActionKinds: [...RUNTIME_UI_BLOCKED_ACTION_KINDS],
    actions,
    actionCount: actions.length,
    allBlocked: actions.every((a) => a.blocked === true),
    anyAllowed: actions.some((a) => a.allowed === true),
    blockedActionsOnly: true,
  };
  return safeCloneGenericModel({ ...core, blockedActionModelDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiBlockedActionModel;
