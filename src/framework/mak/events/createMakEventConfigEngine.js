/**
 * Events Configuration Engine — integração natural ao ModeloBase1.
 */
import { buildMakEventConfigMetadata } from "./buildMakEventConfigMetadata.js";
import { runMakFormEvents, clearMakFormEventRuntimeState } from "./runMakFormEvents.js";
import { MAK_EVENT_NAMES, MAK_EVENT_ACTION_NAMES } from "./makEventBuiltinActions.js";

export function createMakEventConfigEngine(moduleId, options = {}) {
  const { eventDefinitions = [], events = null } = options;
  const metadata = buildMakEventConfigMetadata({ moduleId, eventDefinitions, events });

  const dispatch = (params) =>
    runMakFormEvents({
      moduleId,
      eventDefinitions: metadata.eventDefinitions,
      ...params,
    });

  const hasEvents = () => metadata.eventDefinitionCount > 0;

  const clearRuntime = () => clearMakFormEventRuntimeState(moduleId);

  return Object.freeze({
    moduleId,
    metadata,
    supportedEvents: MAK_EVENT_NAMES,
    supportedActions: MAK_EVENT_ACTION_NAMES,
    dispatch,
    hasEvents,
    clearRuntime,
  });
}

export default createMakEventConfigEngine;
