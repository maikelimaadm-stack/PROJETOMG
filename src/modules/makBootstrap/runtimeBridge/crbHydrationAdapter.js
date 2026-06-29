import { CRB_ENGINE_ENTRY_TYPES } from "./runtimeBridgeConstants.js";

const findRegistryEntry = (registry, entryType) =>
  (registry ?? []).find(
    (entry) =>
      entry?.entryType === entryType &&
      entry?.status === "published" &&
      entry?.enabled !== false
  ) ?? null;

/**
 * Maps CRB registry entries to Foundation engine metadata overrides (empresas pilot).
 * Does not mutate MDP — read-only projection into bootstrap layer.
 * @param {object} crbPayload
 * @param {object} [bootContext]
 */
export function buildCrbHydrationPlan(crbPayload, bootContext = {}) {
  const registry = crbPayload?.registry ?? [];
  const layoutEntry = findRegistryEntry(registry, "layout");
  const fieldConfigEntry = findRegistryEntry(registry, "field_config");
  const validationEntry = findRegistryEntry(registry, "validation");
  const formulaEntry = findRegistryEntry(registry, "formula");
  const eventEntry = findRegistryEntry(registry, "event");
  const actionEntry = findRegistryEntry(registry, "action");
  const workflowEntry = findRegistryEntry(registry, "workflow");

  const layoutPayload = layoutEntry?.payload ?? {};
  const fieldPayload = fieldConfigEntry?.payload ?? {};
  const validationPayload = validationEntry?.payload ?? {};

  const nativeRequiredFromCrb = (validationPayload.rules ?? [])
    .filter((rule) => rule?.rule === "required" && rule?.field)
    .map((rule) => rule.field);

  const nativeFieldsFromCrb = fieldPayload.nativeFields ?? [];
  const allFieldDefinitions = bootContext.fieldDefinitions ?? [];
  const filteredFieldDefinitions =
    nativeFieldsFromCrb.length > 0
      ? allFieldDefinitions.filter((def) => nativeFieldsFromCrb.includes(def.id ?? def.name))
      : allFieldDefinitions;

  const layoutOverrides = {};
  if (Array.isArray(layoutPayload.panels) && layoutPayload.panels.length > 0) {
    layoutOverrides.systemPanelIds = layoutPayload.panels;
  }

  const nativeRequiredFieldNames =
    nativeRequiredFromCrb.length > 0
      ? nativeRequiredFromCrb
      : bootContext.nativeRequiredFieldNames ?? [];

  return Object.freeze({
    moduleId: crbPayload.moduleId,
    versionId: crbPayload.versionId,
    crbVersion: crbPayload.crbVersion,
    registryEntryIds: registry
      .filter((entry) => CRB_ENGINE_ENTRY_TYPES.includes(entry.entryType))
      .map((entry) => entry.entryId),
    layout: {
      entryId: layoutEntry?.entryId ?? null,
      metadataOverrides: layoutOverrides,
    },
    field: {
      entryId: fieldConfigEntry?.entryId ?? null,
      fieldDefinitions: filteredFieldDefinitions,
      engine: fieldPayload.engine ?? "V14",
    },
    validation: {
      entryId: validationEntry?.entryId ?? null,
      nativeRequiredFieldNames,
      engine: validationPayload.engine ?? "V16",
      rules: validationPayload.rules ?? [],
    },
    formula: {
      entryId: formulaEntry?.entryId ?? null,
      engine: formulaEntry?.payload?.engine ?? "V17",
    },
    event: {
      entryId: eventEntry?.entryId ?? null,
      events: eventEntry?.payload?.events ?? [],
    },
    action: {
      entryId: actionEntry?.entryId ?? null,
      actions: actionEntry?.payload?.actions ?? [],
    },
    workflow: {
      entryId: workflowEntry?.entryId ?? null,
      workflows: workflowEntry?.payload?.workflows ?? [],
    },
  });
}

export default buildCrbHydrationPlan;
