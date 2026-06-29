import { defineStudioDesigner } from "@/studio/sdk/studioDesignerContract.js";
import { getContributionManager } from "@/studio/contributions/contributionManager.js";
import { getRegistryManager } from "@/studio/contributions/registryManager/registryManager.js";
import { registerBusinessFieldTypes } from "./businessTypes/businessTypeCatalog.js";
import { FieldCommandTypes } from "./commands/fieldCommandTypes.js";
import { FIELD_DOCUMENT_VERSION } from "./document/fieldDocumentContracts.js";
import { FIELD_AST_VERSION } from "./ast/fieldAstContracts.js";

const DESIGNER_ID = "field";

/** Register Field Studio via Contribution Manager + Registry Manager (Program 2.3) */
export function registerFieldDesigner() {
  const cm = getContributionManager();
  const rm = getRegistryManager();

  rm.register("designers", DESIGNER_ID, defineStudioDesigner({
    designerId: DESIGNER_ID,
    label: "Field Studio",
    supportedEntryTypes: ["field", "field_config", "field-group"],
    supportedBaseTemplates: ["modelobase1"],
  }));

  registerBusinessFieldTypes(rm);

  const commands = [
    { contributionId: "field.addField", id: "field.addField", label: "Criar campo", category: "Field" },
    { contributionId: "field.addFieldFromTemplate", id: "field.addFieldFromTemplate", label: "Criar campo via template", category: "Field" },
    { contributionId: "field.addFieldFromBusinessType", id: "field.addFieldFromBusinessType", label: "Criar Business Type", category: "Field" },
    { contributionId: "field.deleteField", id: "field.deleteField", label: "Excluir campo", category: "Field" },
    { contributionId: "field.reorderField", id: "field.reorderField", label: "Reordenar campo", category: "Field" },
    { contributionId: "field.refreshPreview", id: "field.refreshPreview", label: "Atualizar Preview de Campos", category: "Preview" },
  ];

  commands.forEach((cmd) => {
    const id = cm.registerCommandContribution(DESIGNER_ID, cmd);
    cm.enable(id);
  });

  const propId = cm.registerPropertyContribution(DESIGNER_ID, {
    contributionId: "field.propertyBridge",
    propertyId: "field-document",
    label: "Field Document",
    group: "Field",
    documentVersion: FIELD_DOCUMENT_VERSION,
    astVersion: FIELD_AST_VERSION,
    commandTypes: Object.values(FieldCommandTypes),
  });
  cm.enable(propId);

  return { designerId: DESIGNER_ID, commandsRegistered: commands.length };
}

export default registerFieldDesigner;
