import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { BLOCKED_ACTION_KINDS, uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds the BLOCKED ACTION contract — metadata-only. Enumerates the actions permanently blocked
 * in this contract (create/update/delete/submit/save/export/navigate/openRoute/registerModule).
 * Pure; nothing executes.
 *
 * @param {Object} [options]
 * @returns {Object} blocked action contract
 */
export function createRuntimeUiBlockedActionContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const actions = BLOCKED_ACTION_KINDS.map((action) => ({
    action,
    blocked: true,
    mutation: ['create', 'update', 'delete', 'submit', 'save'].includes(action),
    reason: 'requires future explicit UI runtime implementation slice',
    metadataOnly: true,
  }));

  const core = {
    kind: 'runtime-ui-blocked-action-contract',
    moduleId: String(o.frameMapping?.moduleId ?? o.isolatedRuntime?.moduleId ?? 'plannedModule'),
    actions,
    blockedActionKinds: [...BLOCKED_ACTION_KINDS],
    allBlocked: actions.every((a) => a.blocked === true),
    anyAllowed: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, blockedActionDigest: uiContractDigest(core) });
}

export default createRuntimeUiBlockedActionContract;
