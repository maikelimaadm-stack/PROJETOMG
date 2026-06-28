/**
 * Metadata declarativa da Events Configuration Engine.
 */
import { MAK_EVENT_NAMES } from "./makEventBuiltinActions.js";

export const MAK_EVENT_METADATA_KEYS = Object.freeze([
  "events",
  "listeners",
  "handlers",
  "emit",
  "dispatch",
  "subscribe",
  "unsubscribe",
  "priority",
  "once",
  "debounce",
  "throttle",
  "condition",
  "when",
  "before",
  "after",
  "preventDefault",
  "stopPropagation",
  "async",
  "retry",
  "timeout",
  "action",
  "field",
  "event",
  "channel",
  "suffix",
  "value",
  "message",
  "level",
]);

export function normalizeMakEventDefinitions(source = {}) {
  if (Array.isArray(source)) return source;
  if (!source || typeof source !== "object") return [];

  const definitions = [];
  Object.entries(source).forEach(([eventName, handlers]) => {
    if (!handlers) return;
    const list = Array.isArray(handlers) ? handlers : [handlers];
    list.forEach((entry, index) => {
      if (!entry) return;
      definitions.push({
        id: entry.id ?? `${eventName}-${index}`,
        event: entry.event ?? eventName,
        ...entry,
      });
    });
  });
  return definitions;
}

export function buildMakEventConfigMetadata({
  moduleId,
  eventDefinitions = [],
  events = null,
} = {}) {
  if (!moduleId) {
    throw new Error("buildMakEventConfigMetadata: moduleId é obrigatório.");
  }

  const normalized = normalizeMakEventDefinitions(
    eventDefinitions.length ? eventDefinitions : events ?? []
  );

  const eventTypes = [...new Set(normalized.map((def) => def.event).filter(Boolean))];

  return Object.freeze({
    moduleId,
    engineVersion: 1,
    supportedEvents: MAK_EVENT_NAMES,
    supportedMetadataKeys: MAK_EVENT_METADATA_KEYS,
    eventDefinitionCount: normalized.length,
    eventTypes,
    eventDefinitions: normalized.map((def) => ({
      id: def.id,
      event: def.event,
      field: def.field ?? null,
      priority: def.priority ?? 0,
      once: def.once ?? false,
      debounce: def.debounce ?? null,
      throttle: def.throttle ?? null,
      when: def.when ?? def.condition ?? null,
      handlers: def.handlers ?? (def.action ? [def] : []),
    })),
  });
}

export default buildMakEventConfigMetadata;
