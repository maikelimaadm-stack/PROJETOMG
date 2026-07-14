import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { INTERACTION_KINDS, uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds the INTERACTION BINDING contract — metadata-only. Each interaction is blocked now and
 * requires a future runtime implementation; no real handler is created and no mutation is
 * allowed.
 *
 * @param {Object} [options]
 * @returns {Object} interaction binding contract
 */
export function createRuntimeUiInteractionBindingContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const interactions = INTERACTION_KINDS.map((interactionKind) => ({
    interactionKind,
    sourceAction: interactionKind.startsWith('blocked') ? interactionKind.slice('blocked'.length).toLowerCase() : interactionKind,
    blockedNow: true,
    requiresFutureRuntimeImplementation: true,
    handlerCreated: false,
    mutationAllowed: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'runtime-ui-interaction-binding-contract',
    moduleId: String(o.frameMapping?.moduleId ?? o.isolatedRuntime?.moduleId ?? 'plannedModule'),
    interactions,
    interactionKinds: [...INTERACTION_KINDS],
    anyHandlerCreated: false,
    anyMutationAllowed: false,
    allBlockedNow: interactions.every((i) => i.blockedNow === true),
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, interactionBindingDigest: uiContractDigest(core) });
}

export default createRuntimeUiInteractionBindingContract;
