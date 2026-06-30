/** Converts MDP introspect registry entries into Explorer tree nodes. */

function resolveLabel(entry) {
  if (entry?.label) return entry.label;
  if (entry?.labels?.length) return entry.labels[0].label ?? entry.entryId;
  if (entry?.presentation?.label) return entry.presentation.label;
  const id = entry?.entryId ?? entry?.entry_id ?? "";
  return id.split(".").pop() ?? id;
}

function normalizeEntry(entry) {
  return {
    entryId: entry.entryId ?? entry.entry_id,
    entryType: entry.entryType ?? entry.entry_type,
    label: resolveLabel(entry),
  };
}

const LAYOUT_CHILD_TYPES = new Set(["section", "panel", "view", "form"]);
const ROOT_TYPES = new Set(["base_template", "template"]);

/**
 * @param {Array<object>} registryEntries — from MDP introspect
 * @returns {Array<object>} explorer tree
 */
export function buildExplorerTreeFromRegistry(registryEntries = []) {
  if (!registryEntries.length) return [];

  const normalized = registryEntries.map(normalizeEntry).filter((e) => e.entryId);
  const byType = Object.groupBy(normalized, (e) => e.entryType);

  const baseTemplate = (byType.base_template ?? byType.template ?? [])[0];
  const layouts = byType.layout ?? [];
  const sections = normalized.filter((e) => LAYOUT_CHILD_TYPES.has(e.entryType));

  const layoutNodes = layouts.map((layout) => ({
    ...layout,
    children: sections.filter(
      (s) => s.entryId.startsWith(layout.entryId.split(".").slice(0, 2).join(".")) || sections.length <= 4
    ).slice(0, 8),
  }));

  const otherChildren = ["field_config", "validation", "workflow", "dashboard", "report", "automation"]
    .flatMap((type) => byType[type] ?? [])
    .slice(0, 6);

  if (baseTemplate) {
    return [
      {
        ...baseTemplate,
        children: [...layoutNodes, ...otherChildren],
      },
    ];
  }

  if (layouts.length) {
    return layoutNodes.length ? layoutNodes : layouts;
  }

  return normalized.slice(0, 20).map((e) => ({ ...e, children: [] }));
}

/**
 * Derive property grid fields from CRB fields for a selected entry.
 * @param {Array<object>} fields
 * @param {string|null} entryId
 */
export function buildPropertyFieldsFromCrb(fields = [], entryId = null) {
  const relevant = entryId
    ? fields.filter((f) => f.entryId === entryId || f.fieldId?.startsWith(entryId))
    : fields.slice(0, 8);

  return relevant.slice(0, 12).map((f) => ({
    propertyId: f.fieldId ?? f.id ?? f.name,
    label: f.label ?? f.fieldId ?? "Campo",
    type: f.type === "boolean" ? "boolean" : f.type === "number" ? "number" : "string",
    value: f.defaultValue ?? "",
    group: f.group ?? "General",
  }));
}

export default buildExplorerTreeFromRegistry;
