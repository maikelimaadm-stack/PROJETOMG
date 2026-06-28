/**
 * Metadata declarativa da Actions Configuration Engine.
 */
import { MAK_ACTION_TYPE_NAMES } from "./makActionBuiltinTypes.js";

export const MAK_ACTION_METADATA_KEYS = Object.freeze([
  "actions",
  "execute",
  "run",
  "sequence",
  "parallel",
  "condition",
  "when",
  "before",
  "after",
  "retry",
  "timeout",
  "delay",
  "continueOnError",
  "rollback",
  "transaction",
  "permissions",
  "target",
  "payload",
  "context",
  "parameters",
  "result",
  "response",
  "action",
  "actionId",
  "runAction",
  "actions",
  "then",
  "else",
  "priority",
  "mock",
]);

export function normalizeMakActionDefinitions(source = {}) {
  if (Array.isArray(source)) return source;
  if (!source || typeof source !== "object") return [];

  const definitions = [];
  Object.entries(source).forEach(([key, value]) => {
    if (!value) return;
    const list = Array.isArray(value) ? value : [value];
    list.forEach((entry, index) => {
      if (!entry) return;
      definitions.push({
        id: entry.id ?? key ?? `action-${index}`,
        ...entry,
      });
    });
  });
  return definitions;
}

export function buildMakActionConfigMetadata({
  moduleId,
  actionDefinitions = [],
  actions = null,
} = {}) {
  if (!moduleId) {
    throw new Error("buildMakActionConfigMetadata: moduleId é obrigatório.");
  }

  const normalized = normalizeMakActionDefinitions(
    actionDefinitions.length ? actionDefinitions : actions ?? []
  );

  return Object.freeze({
    moduleId,
    engineVersion: 1,
    supportedActionTypes: MAK_ACTION_TYPE_NAMES,
    supportedMetadataKeys: MAK_ACTION_METADATA_KEYS,
    actionDefinitionCount: normalized.length,
    actionDefinitions: normalized.map((def) => ({
      id: def.id,
      action: def.action ?? def.type ?? "noop",
      priority: def.priority ?? 0,
      when: def.when ?? def.condition ?? null,
      rollback: def.rollback ?? null,
      permissions: def.permissions ?? null,
      parameters: def.parameters ?? def.params ?? null,
    })),
  });
}

export default buildMakActionConfigMetadata;
