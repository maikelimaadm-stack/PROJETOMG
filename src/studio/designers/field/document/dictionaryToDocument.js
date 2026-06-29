import { createEmptyFieldDocument, DEFAULT_FIELD_ENTITY_ID } from "./fieldDocumentContracts.js";

function mdpFieldToFieldNode(row, entityId) {
  const fieldName = row.fieldName ?? row.field_name;
  return {
    fieldNodeId: row.id ?? row.fieldId ?? `field.${fieldName}`,
    mdpRowId: row.id ?? null,
    fieldId: row.fieldId ?? row.field_id,
    fieldName,
    entityId: row.entityId ?? row.entity_id ?? entityId,
    fieldType: row.fieldType ?? row.field_type ?? "string",
    source: row.source ?? "custom",
    label: row.label ?? fieldName,
    required: Boolean(row.required),
    readOnly: Boolean(row.readOnly ?? row.read_only),
    active: row.active !== false,
    visibleForm: row.visibleForm ?? row.visible_form ?? true,
    visibleTable: row.visibleTable ?? row.visible_table ?? false,
    sortOrder: row.sortOrder ?? row.sort_order ?? row.tableOrder ?? 0,
    labels: row.labels ?? [{ locale: "pt-BR", label: row.label ?? fieldName }],
  };
}

/** MDP Field Dictionary list → Field Document (empresas pilot) */
export function dictionaryToFieldDocument(items = [], moduleId = "empresas", entityId = DEFAULT_FIELD_ENTITY_ID) {
  const customFields = (items ?? [])
    .filter((row) => row.source === "custom" || row.source === "virtual")
    .map((row) => mdpFieldToFieldNode(row, entityId))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  return createEmptyFieldDocument({
    documentId: `${moduleId}.field.${entityId}`,
    moduleId,
    entityId,
    metadata: {
      label: "Field Studio",
      status: "draft",
      fieldCount: customFields.length,
    },
    groups: [
      {
        groupId: "group.main",
        label: "Campos personalizados",
        fields: customFields,
      },
    ],
  });
}

export default dictionaryToFieldDocument;
