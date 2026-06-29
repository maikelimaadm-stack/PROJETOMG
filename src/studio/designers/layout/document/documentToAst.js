import { createLayoutAst } from "../ast/layoutAstContracts.js";

/** Layout Document → Layout AST */
export function documentToAst(document) {
  const pages = document.pages ?? [];
  return createLayoutAst({
    documentId: document.documentId,
    moduleId: document.moduleId,
    root: {
      nodeId: document.documentId,
      nodeType: "layout",
      refId: document.documentId,
      attrs: {
        metadata: document.metadata,
        bindings: document.bindings,
        rules: document.rules,
        styles: document.styles,
        behaviors: document.behaviors,
      },
      children: pages.map((page) => ({
        nodeId: page.pageId,
        nodeType: "page",
        refId: page.pageId,
        attrs: { label: page.label },
        children: (page.sections ?? []).map((section) => ({
          nodeId: section.sectionId,
          nodeType: "section",
          refId: section.sectionId,
          attrs: {
            label: section.label,
            bindings: section.bindings,
            rules: section.rules,
          },
          children: (section.containers ?? []).map((container) => ({
            nodeId: container.containerId,
            nodeType: "container",
            refId: container.containerId,
            attrs: {
              type: container.type,
              styles: container.styles,
              bindings: container.bindings,
            },
            children: (container.components ?? []).map((component) => ({
              nodeId: component.componentId,
              nodeType: "component",
              refId: component.componentId,
              attrs: {
                type: component.type,
                props: component.props,
                bindings: component.bindings,
                rules: component.rules,
                styles: component.styles,
                behaviors: component.behaviors,
                frame: component.frame,
              },
            })),
          })),
        })),
      })),
    },
  });
}

export default documentToAst;
