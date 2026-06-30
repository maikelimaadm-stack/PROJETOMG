/** Layout Document ↔ SOM object mapping adapters */

import { createSomObject } from "@/studio/som/index.js";

export function layoutComponentToSomObject(component) {
  return createSomObject({
    objectId: component.componentId,
    kind: "component",
    label: component.type,
    attrs: {
      type: component.type,
      frame: component.frame,
      styles: component.styles,
      rules: component.rules,
    },
    properties: component.props ?? {},
    bindings: component.bindings ?? [],
    behaviors: component.behaviors ?? [],
  });
}

export function layoutDocumentToSomObjects(document) {
  const objects = [];
  (document.pages ?? []).forEach((page) => {
    objects.push(
      createSomObject({
        objectId: page.pageId,
        kind: "page",
        label: page.label,
        attrs: { label: page.label },
      })
    );
    (page.sections ?? []).forEach((section) => {
      objects.push(
        createSomObject({
          objectId: section.sectionId,
          kind: "section",
          label: section.label,
          attrs: { label: section.label, rules: section.rules },
          bindings: section.bindings ?? [],
        })
      );
      (section.containers ?? []).forEach((container) => {
        (container.components ?? []).forEach((component) => {
          objects.push(layoutComponentToSomObject(component));
        });
      });
    });
  });
  return Object.freeze(objects);
}

export function layoutArtifactToSomObject(document) {
  return createSomObject({
    objectId: document.documentId,
    kind: "artifact",
    label: document.metadata?.label ?? "Layout",
    attrs: {
      documentVersion: document.documentVersion,
      moduleId: document.moduleId,
      entityId: document.entityId,
      metadata: document.metadata,
      styles: document.styles,
      rules: document.rules,
    },
    bindings: document.bindings ?? [],
    behaviors: document.behaviors ?? [],
  });
}

export default layoutDocumentToSomObjects;
