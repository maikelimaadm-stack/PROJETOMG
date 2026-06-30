import { defineStudioDesigner } from "@/studio/sdk/studioDesignerContract.js";
import { getContributionManager } from "@/studio/contributions/contributionManager.js";
import { getRegistryManager } from "@/studio/contributions/registryManager/registryManager.js";
import { LayoutCommandTypes } from "./commands/layoutCommandTypes.js";
import { LAYOUT_DOCUMENT_VERSION } from "./document/layoutDocumentContracts.js";
import { LAYOUT_AST_VERSION } from "./ast/layoutAstContracts.js";

const DESIGNER_ID = "layout";

/** Register Layout Studio via Contribution Manager + Registry Manager (Program 2.2) */
export function registerLayoutDesigner() {
  const cm = getContributionManager();
  const rm = getRegistryManager();

  rm.register("designers", DESIGNER_ID, defineStudioDesigner({
    designerId: DESIGNER_ID,
    label: "Layout Studio",
    supportedEntryTypes: ["layout", "section", "panel", "component"],
    supportedBaseTemplates: ["modelobase1"],
  }));

  const commands = [
    { contributionId: "layout.addComponent", id: "layout.addComponent", label: "Adicionar componente", category: "Layout" },
    { contributionId: "layout.deleteComponent", id: "layout.deleteComponent", label: "Remover componente", category: "Layout" },
    { contributionId: "layout.duplicateComponent", id: "layout.duplicateComponent", label: "Duplicar componente", category: "Layout" },
    { contributionId: "layout.refreshPreview", id: "layout.refreshPreview", label: "Atualizar Preview do Layout", category: "Preview" },
  ];

  commands.forEach((cmd) => {
    const id = cm.registerCommandContribution(DESIGNER_ID, cmd);
    cm.enable(id);
  });

  const propId = cm.registerPropertyContribution(DESIGNER_ID, {
    contributionId: "layout.propertyBridge",
    propertyId: "layout-document",
    label: "Layout Document",
    group: "Layout",
    documentVersion: LAYOUT_DOCUMENT_VERSION,
    astVersion: LAYOUT_AST_VERSION,
    commandTypes: Object.values(LayoutCommandTypes),
  });
  cm.enable(propId);

  return { designerId: DESIGNER_ID, commandsRegistered: commands.length };
}

export default registerLayoutDesigner;
