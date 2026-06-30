/**
 * Formula Builder — Editor Engine registration (Program 3.2)
 */
import { getEditorCatalog } from "@/studio/editor/index.js";
import { FormulaDesignerPlugin } from "../FormulaDesignerPlugin.jsx";

const DESIGNER_ID = "formula";

export function registerFormulaEditor(catalog = getEditorCatalog()) {
  return catalog.registerDesigner({
    designerId: DESIGNER_ID,
    label: "Formula Builder",
    mount: ({ moduleId, onValidationChange, onPreviewChange }) => (
      <FormulaDesignerPlugin
        moduleId={moduleId}
        onValidationChange={onValidationChange}
        onPreviewChange={onPreviewChange}
      />
    ),
    tools: [{ id: "formula.insert", label: "Inserir token" }],
    panels: [
      { id: "formula.shell", label: "Formula Builder", slot: "workspace" },
      { id: "formula.validation", label: "Validação", slot: "bottom" },
    ],
    commands: [
      { id: "formula.open", label: "Abrir Formula Builder" },
      { id: "formula.clear", label: "Limpar fórmula" },
    ],
    objects: [{ kind: "formula" }],
    behaviors: [{ id: "formula.onChange", trigger: "onChange" }],
    renderers: [{ id: "formula.shell", kind: "workspace" }],
    bridge: Object.freeze({
      supportsPropertyEdit: false,
      propertyEmptyState: "Formula Builder — authoring visual",
      inspectorBindingsLabel: "Computation Engine pipeline",
    }),
  });
}

export default registerFormulaEditor;
