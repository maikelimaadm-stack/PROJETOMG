/**
 * Field Studio — Editor Engine registration (Program 2.3)
 * Registers tools, panels, commands, objects, behaviors, renderers — no local editor implementation.
 */
import { getEditorCatalog } from "@/studio/editor/index.js";
import { FieldDesignerPlugin } from "../FieldDesignerPlugin.jsx";

const DESIGNER_ID = "field";

export function registerFieldEditor(catalog = getEditorCatalog()) {
  return catalog.registerDesigner({
    designerId: DESIGNER_ID,
    label: "Field Studio",
    mount: ({ moduleId, sdk, hub, editor, onValidationChange, onPreviewChange }) => (
      <FieldDesignerPlugin
        moduleId={moduleId}
        sdk={sdk}
        hub={hub}
        editor={editor}
        onValidationChange={onValidationChange}
        onPreviewChange={onPreviewChange}
      />
    ),
    tools: [{ id: "field.select", label: "Seleção" }],
    panels: [
      { id: "field.canvas", label: "Lista de Campos", slot: "workspace" },
      { id: "field.properties", label: "Property Grid", slot: "right" },
      { id: "field.formula-bridge", label: "Formula Builder", slot: "bottom" },
    ],
    commands: [
      { id: "field.addField", label: "Criar campo" },
      { id: "field.deleteField", label: "Excluir campo" },
    ],
    objects: [{ kind: "field" }, { kind: "field-group" }],
    behaviors: [{ id: "field.onLoad", trigger: "onLoad" }],
    renderers: [{ id: "field.canvas", kind: "canvas" }],
    bridge: Object.freeze({
      supportsPropertyEdit: true,
      propertyEmptyState: "Property Grid — selecione um campo na lista",
      inspectorBindingsLabel: "Editável via Field Document",
    }),
  });
}

export default registerFieldEditor;
