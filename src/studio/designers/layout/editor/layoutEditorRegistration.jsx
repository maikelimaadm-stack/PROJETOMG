/**
 * Layout Studio — Editor Engine registration (Program 2.2.7)
 * Registers tools, panels, commands, objects, behaviors, renderers — no local editor implementation.
 */
import { getEditorCatalog } from "@/studio/editor/index.js";
import { LayoutDesignerPlugin } from "../LayoutDesignerPlugin.jsx";

const DESIGNER_ID = "layout";

export function registerLayoutEditor(catalog = getEditorCatalog()) {
  return catalog.registerDesigner({
    designerId: DESIGNER_ID,
    label: "Layout Studio",
    mount: ({ moduleId, sdk, hub, editor, onValidationChange, onPreviewChange }) => (
      <LayoutDesignerPlugin
        moduleId={moduleId}
        sdk={sdk}
        hub={hub}
        editor={editor}
        onValidationChange={onValidationChange}
        onPreviewChange={onPreviewChange}
      />
    ),
    tools: [{ id: "layout.select", label: "Seleção" }],
    panels: [
      { id: "layout.canvas", label: "Canvas", slot: "workspace" },
      { id: "layout.properties", label: "Property Grid", slot: "right" },
    ],
    commands: [
      { id: "layout.addComponent", label: "Adicionar componente" },
      { id: "layout.deleteComponent", label: "Remover componente" },
    ],
    objects: [{ kind: "component" }, { kind: "section" }, { kind: "page" }],
    behaviors: [{ id: "layout.onLoad", trigger: "onLoad" }],
    renderers: [{ id: "layout.canvas", kind: "canvas" }],
    bridge: Object.freeze({
      supportsPropertyEdit: true,
      propertyEmptyState: "Property Grid — selecione um componente no Canvas",
      inspectorBindingsLabel: "Editável via Layout Document",
    }),
  });
}

export default registerLayoutEditor;
