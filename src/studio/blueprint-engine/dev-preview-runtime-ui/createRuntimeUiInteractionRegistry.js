import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_INTERACTION_KINDS, runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * The interaction registry. Every interaction is blocked / no-op safe / metadata only. No real
 * mutation, navigation, submit or save. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createRuntimeUiInteractionRegistry() {
  const interactions = RUNTIME_UI_INTERACTION_KINDS.map((kind) => ({
    kind,
    blocked: true,
    handler: 'noop_safe',
    realHandlerCreated: false,
  }));
  const core = {
    kind: 'runtime-ui-interaction-registry',
    interactions,
    interactionCount: interactions.length,
    allBlocked: interactions.every((i) => i.blocked === true),
    anyRealHandler: interactions.some((i) => i.realHandlerCreated === true),
    realMutation: false,
    realNavigation: false,
    realSubmit: false,
    realSave: false,
  };
  return safeCloneGenericModel({ ...core, interactionRegistryDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiInteractionRegistry;
