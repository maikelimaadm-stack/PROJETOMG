/** Layout AST → MDP registry payloads (Studio Core AST compiler) */

function extractFieldIds(sectionNode) {
  const fields = [];
  (sectionNode.children ?? []).forEach((container) => {
    (container.children ?? []).forEach((component) => {
      if (component.attrs?.type === "field" && component.attrs?.props?.fieldId) {
        fields.push(component.attrs.props.fieldId);
      }
    });
  });
  return fields;
}

export function astRootToMdpPayloads(ast) {
  const root = ast.root;
  const attrs = root.attrs ?? {};
  const pages = root.children ?? [];

  const layoutPayload = {
    layoutKey: attrs.metadata?.layoutKey ?? ast.documentId,
    panels: [],
    defaultLayoutRef: attrs.metadata?.defaultLayoutRef ?? null,
    rules: attrs.rules ?? [],
    styles: attrs.styles ?? {},
    behaviors: attrs.behaviors ?? {},
  };

  const entries = [];

  pages.forEach((page) => {
    (page.children ?? []).forEach((sectionNode) => {
      const panelKey = sectionNode.refId?.split(".").pop() ?? sectionNode.nodeId;
      layoutPayload.panels.push(panelKey);

      entries.push({
        entryId: sectionNode.refId ?? sectionNode.nodeId,
        entryType: "section",
        moduleId: ast.moduleId,
        payload: {
          sectionKey: panelKey,
          label: sectionNode.attrs?.label,
          fields: extractFieldIds(sectionNode),
          rules: sectionNode.attrs?.rules ?? [],
        },
        labels: [{ locale: "pt-BR", label: sectionNode.attrs?.label ?? panelKey }],
        bindings: sectionNode.attrs?.bindings ?? [],
      });

      (sectionNode.children ?? []).forEach((containerNode) => {
        entries.push({
          entryId: containerNode.refId ?? containerNode.nodeId,
          entryType: "panel",
          moduleId: ast.moduleId,
          payload: {
            panelKey: containerNode.refId?.split(".").pop() ?? containerNode.nodeId,
            sections: [panelKey],
            styles: containerNode.attrs?.styles ?? {},
          },
          labels: [{ locale: "pt-BR", label: containerNode.attrs?.label ?? "Painel" }],
          bindings: containerNode.attrs?.bindings ?? [],
        });
      });
    });
  });

  entries.unshift({
    entryId: ast.documentId,
    entryType: "layout",
    moduleId: ast.moduleId,
    payload: layoutPayload,
    labels: [{ locale: "pt-BR", label: attrs.metadata?.label ?? "Layout" }],
    bindings: attrs.bindings ?? [],
  });

  return entries;
}

export { documentToRegistryPayloads } from "../core/layoutCoreSetup.js";

export function astToRegistryPayloads(ast) {
  return astRootToMdpPayloads(ast);
}

export default astRootToMdpPayloads;
