import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ISOLATED_RUNTIME_EVENT_KINDS, runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * A purely functional EVENT DISPATCHER. Pure. Given the event kinds, it returns each as a
 * metadata descriptor marked allowed (read-side) or blocked (mutating/denied). There is NO real
 * EventEmitter, NO listener, NO external handler, NO mutation, NO network, NO storage.
 *
 * @param {Object} [options]
 * @returns {Object} event dispatcher descriptor
 */
export function createIsolatedRuntimeEventDispatcher(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const events = ISOLATED_RUNTIME_EVENT_KINDS.map((event) => {
    const blocked = event === 'renderBlocked' || event === 'interactionBlocked' || event === 'permissionDenied';
    return {
      event,
      allowed: !blocked,
      blocked,
      hasRealHandler: false,
      hasRealListener: false,
      mutation: false,
      metadataOnly: true,
    };
  });

  const core = {
    kind: 'isolated-runtime-event-dispatcher',
    moduleId: String(o.implementationPlan?.moduleId ?? 'plannedModule'),
    events,
    eventKinds: [...ISOLATED_RUNTIME_EVENT_KINDS],
    usesEventEmitter: false,
    anyRealHandler: false,
    anyRealListener: false,
    anyMutation: false,
    usesNetwork: false,
    usesStorage: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, eventDispatcherDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeEventDispatcher;
