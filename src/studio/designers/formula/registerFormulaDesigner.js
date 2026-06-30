import { defineStudioDesigner } from "@/studio/sdk/studioDesignerContract.js";
import { getContributionManager } from "@/studio/contributions/contributionManager.js";
import { getRegistryManager } from "@/studio/contributions/registryManager/registryManager.js";
import { FORMULA_DOCUMENT_VERSION } from "./contracts/formulaContracts.js";
import { FORMULA_BUILDER_VERSION } from "./contracts/formulaContracts.js";

const DESIGNER_ID = "formula";

export function registerFormulaDesigner() {
  const cm = getContributionManager();
  const rm = getRegistryManager();

  rm.register("designers", DESIGNER_ID, defineStudioDesigner({
    designerId: DESIGNER_ID,
    label: "Formula Builder",
    supportedEntryTypes: ["formula", "field_computation"],
    supportedBaseTemplates: ["modelobase1"],
  }));

  const commands = [
    { contributionId: "formula.open", id: "formula.open", label: "Abrir Formula Builder", category: "Formula" },
    { contributionId: "formula.clear", id: "formula.clear", label: "Limpar fórmula", category: "Formula" },
    { contributionId: "formula.refreshPreview", id: "formula.refreshPreview", label: "Atualizar preview", category: "Preview" },
  ];

  commands.forEach((cmd) => {
    const id = cm.registerCommandContribution(DESIGNER_ID, cmd);
    cm.enable(id);
  });

  const propId = cm.registerPropertyContribution(DESIGNER_ID, {
    contributionId: "formula.propertyBridge",
    propertyId: "formula-document",
    label: "Formula Document",
    group: "Formula",
    documentVersion: FORMULA_DOCUMENT_VERSION,
    builderVersion: FORMULA_BUILDER_VERSION,
  });
  cm.enable(propId);

  return { designerId: DESIGNER_ID, commandsRegistered: commands.length };
}

export default registerFormulaDesigner;
