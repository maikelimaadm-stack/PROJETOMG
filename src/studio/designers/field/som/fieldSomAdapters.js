import { createSomObject } from "@/studio/som/index.js";

export function fieldNodeToSomObject(field) {
  return createSomObject({
    objectId: field.fieldNodeId,
    kind: "field",
    label: field.label ?? field.fieldName,
    attrs: {
      fieldType: field.fieldType,
      source: field.source,
      entityId: field.entityId,
    },
    properties: {
      fieldName: field.fieldName,
      label: field.label,
      required: field.required,
      readOnly: field.readOnly,
      visibleForm: field.visibleForm,
      visibleTable: field.visibleTable,
      active: field.active,
    },
  });
}

export function fieldDocumentToSomObjects(document) {
  const objects = [];
  (document.groups ?? []).forEach((group) => {
    (group.fields ?? [])
      .filter((f) => !f._pendingDelete)
      .forEach((field) => objects.push(fieldNodeToSomObject(field)));
  });
  return Object.freeze(objects);
}

export default fieldDocumentToSomObjects;
