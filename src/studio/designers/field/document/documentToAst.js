/** Field Document → AST root node (Studio Core AST transformer) */

export function fieldDocumentToAstRoot(document) {
  const groups = document.groups ?? [];
  return {
    nodeId: document.documentId,
    nodeType: "field-document",
    refId: document.documentId,
    attrs: {
      entityId: document.entityId,
      moduleId: document.moduleId,
      metadata: document.metadata,
    },
    children: groups.map((group) => ({
      nodeId: group.groupId,
      nodeType: "field-group",
      refId: group.groupId,
      attrs: { label: group.label, category: group.category },
      children: (group.fields ?? [])
        .filter((f) => !f._pendingDelete)
        .map((field) => ({
          nodeId: field.fieldNodeId,
          nodeType: "field",
          refId: field.fieldId,
          attrs: {
            fieldName: field.fieldName,
            fieldType: field.fieldType,
            source: field.source,
            label: field.label,
            required: field.required,
            readOnly: field.readOnly,
            visibleForm: field.visibleForm,
            visibleTable: field.visibleTable,
            sortOrder: field.sortOrder,
            mdpRowId: field.mdpRowId,
            category: field.category,
            groupId: field.groupId,
            smartTemplateId: field.smartTemplateId,
            businessTypeId: field.businessTypeId,
            placeholder: field.placeholder,
            useMask: field.useMask,
            maskText: field.maskText,
          },
        })),
    })),
  };
}

export default fieldDocumentToAstRoot;
