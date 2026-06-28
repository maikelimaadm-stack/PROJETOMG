/**
 * Metadata declarativa da Workflow Configuration Engine.
 */
import { MAK_WORKFLOW_STEP_TYPES } from "./makWorkflowBuiltinSteps.js";

export const MAK_WORKFLOW_METADATA_KEYS = Object.freeze([
  "workflow",
  "workflows",
  "steps",
  "transitions",
  "start",
  "finish",
  "state",
  "status",
  "condition",
  "when",
  "before",
  "after",
  "parallel",
  "sequence",
  "branch",
  "merge",
  "loop",
  "wait",
  "delay",
  "retry",
  "rollback",
  "timeout",
  "approval",
  "rejection",
  "notifications",
  "trigger",
  "from",
  "to",
  "onEnter",
  "onExit",
]);

export function normalizeMakWorkflowDefinitions(source = {}) {
  if (Array.isArray(source)) return source;
  if (!source || typeof source !== "object") return [];

  const definitions = [];
  Object.entries(source).forEach(([key, value]) => {
    if (!value) return;
    const list = Array.isArray(value) ? value : [value];
    list.forEach((entry, index) => {
      if (!entry) return;
      definitions.push({
        id: entry.id ?? key ?? `workflow-${index}`,
        ...entry,
      });
    });
  });
  return definitions;
}

export function buildMakWorkflowConfigMetadata({
  moduleId,
  workflowDefinitions = [],
  workflows = null,
} = {}) {
  if (!moduleId) {
    throw new Error("buildMakWorkflowConfigMetadata: moduleId é obrigatório.");
  }

  const normalized = normalizeMakWorkflowDefinitions(
    workflowDefinitions.length ? workflowDefinitions : workflows ?? []
  );

  return Object.freeze({
    moduleId,
    engineVersion: 1,
    supportedStepTypes: MAK_WORKFLOW_STEP_TYPES,
    supportedMetadataKeys: MAK_WORKFLOW_METADATA_KEYS,
    workflowDefinitionCount: normalized.length,
    workflowDefinitions: normalized.map((def) => ({
      id: def.id,
      start: def.start ?? def.initialState ?? "draft",
      finish: def.finish ?? def.finalStates ?? [],
      states: def.states ?? {},
      transitions: def.transitions ?? [],
      steps: def.steps ?? null,
    })),
  });
}

export default buildMakWorkflowConfigMetadata;
