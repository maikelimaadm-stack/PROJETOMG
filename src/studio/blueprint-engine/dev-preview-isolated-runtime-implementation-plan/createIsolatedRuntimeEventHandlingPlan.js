import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { EVENT_HANDLING_KINDS, planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the EVENT HANDLING plan. Pure, metadata-only. Describes the events a future runtime
 * WOULD handle (previewRequested … disposed) as metadata. There is NO real EventEmitter, NO
 * listener, NO handler, NO mutation.
 *
 * @param {Object} [options]
 * @returns {Object} event handling plan
 */
export function createIsolatedRuntimeEventHandlingPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const events = EVENT_HANDLING_KINDS.map((event) => ({
    event,
    kind: event === 'permissionDenied' || event.includes('Blocked') ? 'blocked' : 'read',
    hasRealHandler: false,
    hasRealListener: false,
    mutation: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'isolated-runtime-event-handling-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    events,
    eventKinds: [...EVENT_HANDLING_KINDS],
    usesEventEmitter: false,
    anyRealHandler: false,
    anyRealListener: false,
    anyMutation: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, eventHandlingDigest: planDigest(core) });
}

export default createIsolatedRuntimeEventHandlingPlan;
