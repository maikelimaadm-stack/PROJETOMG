/**
 * MDP substrate bridge — records optional linkage without dual-write SSOT.
 * Legacy MdpRegistryEntry remains independent; MMM is canonical for 226 objectTypes.
 */
export const buildMdpSubstrateRef = ({ objectType, moduleId, scope }) => {
  const legacyTypeMap = {
    layout: "layout",
    view: "view",
    form: "form",
    section: "section",
    panel: "panel",
    tab: "tab",
    group: "group",
    field: "field",
    field_config: "field_config",
    action: "action",
    event: "event",
    formula: "formula",
    validation: "validation",
    workflow: "workflow",
    dashboard: "dashboard",
    pivot_table: "pivot_table",
    report: "report",
    permission: "permission",
    automation: "automation",
    base_template: "base_template",
    template: "template",
    integration: "integration",
    ai_definition: "ai_definition",
    studio_definition: "studio_definition",
    theme: "theme",
  };

  const legacyEntryType = legacyTypeMap[objectType];
  if (!legacyEntryType) {
    return {
      substrate: "mdp",
      linked: false,
      reason: "objectType has no legacy MDP registry mapping",
      moduleId: moduleId ?? scope?.moduleId ?? null,
    };
  }

  return {
    substrate: "mdp",
    linked: true,
    legacyEntryType,
    moduleId: moduleId ?? scope?.moduleId ?? null,
    note: "Reference only — MMM envelope is SSOT (D-MMM-01)",
  };
};

export const summarizeSubstrateCoverage = (objects = []) => {
  const linked = objects.filter((row) => row.mdp_substrate_ref?.linked).length;
  return {
    substrate: "mdp",
    total: objects.length,
    legacyMapped: linked,
    mmmOnly: objects.length - linked,
  };
};
