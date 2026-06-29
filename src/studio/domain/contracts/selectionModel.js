/** Official MAK Studio Selection Model — Program 2.1B (single contract for all Studios) */

export const STUDIO_SELECTION_MODEL_VERSION = "mak-studio-selection-v1";

/** All Studios MUST use these kinds — no custom selection models. */
export const OFFICIAL_SELECTION_KINDS = Object.freeze([
  "entity",
  "field",
  "layout",
  "component",
  "node",
  "workflow_step",
  "dashboard_widget",
  "report_item",
  "automation_node",
]);

/** Maps MDP registry entry types to official selection kinds. */
export const ENTRY_TYPE_TO_SELECTION_KIND = Object.freeze({
  base_template: "entity",
  template: "entity",
  entity: "entity",
  field: "field",
  field_config: "field",
  layout: "layout",
  component: "component",
  section: "node",
  panel: "node",
  node: "node",
  workflow: "workflow_step",
  workflow_step: "workflow_step",
  dashboard: "dashboard_widget",
  dashboard_widget: "dashboard_widget",
  report: "report_item",
  report_item: "report_item",
  automation: "automation_node",
  automation_node: "automation_node",
});

/**
 * @typedef {object} StudioSelection
 * @property {string|null} selectionKind — one of OFFICIAL_SELECTION_KINDS
 * @property {string|null} targetId — canonical selection target id
 * @property {string|null} entryId — alias for targetId (explorer compat)
 * @property {string|null} entryType — source entry type from MDP
 * @property {string|null} moduleId
 * @property {string|null} designerId
 * @property {Record<string, unknown>} [metadata]
 */

export function resolveSelectionKind(entryType) {
  if (!entryType) return null;
  return ENTRY_TYPE_TO_SELECTION_KIND[entryType] ?? "node";
}

export function createStudioSelection(partial = {}) {
  const entryType = partial.entryType ?? null;
  const targetId = partial.targetId ?? partial.entryId ?? null;
  const selectionKind = partial.selectionKind ?? resolveSelectionKind(entryType);
  return Object.freeze({
    selectionKind,
    targetId,
    entryId: targetId,
    entryType,
    moduleId: partial.moduleId ?? null,
    designerId: partial.designerId ?? null,
    metadata: Object.freeze({ ...(partial.metadata ?? {}) }),
  });
}

export function validateStudioSelection(selection) {
  const errors = [];
  if (!selection) return { valid: false, errors: ["Selection is required."] };
  if (selection.targetId && !selection.selectionKind) {
    errors.push("selectionKind is required when targetId is set.");
  }
  if (selection.selectionKind && !OFFICIAL_SELECTION_KINDS.includes(selection.selectionKind)) {
    errors.push(`Invalid selectionKind: ${selection.selectionKind}`);
  }
  return { valid: errors.length === 0, errors };
}

export default createStudioSelection;
