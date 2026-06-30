import { createEmptyFieldDocument, DEFAULT_FIELD_ENTITY_ID } from "./fieldDocumentContracts.js";
import { parseFieldPresentation } from "./fieldPresentationAdapter.js";

function mdpFieldToFieldNode(row, entityId) {
  const fieldName = row.fieldName ?? row.field_name;
  const defaultLabel = row.labels?.find((l) => l.locale === "pt-BR") ?? row.labels?.[0];
  const presentation = parseFieldPresentation(row.presentation ?? {}, row);

  return {
    fieldNodeId: row.id ?? row.fieldId ?? `field.${fieldName}`,
    mdpRowId: row.id ?? null,
    fieldId: row.fieldId ?? row.field_id,
    fieldName,
    entityId: row.entityId ?? row.entity_id ?? entityId,
    fieldType: row.fieldType ?? row.field_type ?? "string",
    source: row.source ?? "custom",
    label: row.label ?? defaultLabel?.label ?? fieldName,
    required: Boolean(row.required),
    readOnly: Boolean(row.readOnly ?? row.read_only),
    active: row.active !== false,
    visibleForm: row.visibleForm ?? row.visible_form ?? true,
    visibleTable: row.visibleTable ?? row.visible_table ?? false,
    sortOrder: row.sortOrder ?? row.sort_order ?? row.tableOrder ?? 0,
    groupId: presentation.groupId ?? "group.main",
    category: presentation.category ?? null,
    placeholder: row.placeholder ?? defaultLabel?.placeholder ?? null,
    helpText: defaultLabel?.helpText ?? defaultLabel?.description ?? null,
    useMask: Boolean(row.useMask ?? row.use_mask),
    maskText: row.maskText ?? row.mask_text ?? null,
    defaultValue: presentation.defaultValue ?? null,
    minValue: presentation.minValue ?? null,
    maxValue: presentation.maxValue ?? null,
    precision: presentation.precision ?? row.decimalPlaces ?? null,
    scale: presentation.scale ?? null,
    smartTemplateId: presentation.smartTemplateId ?? null,
    businessTypeId: presentation.businessTypeId ?? null,
    icon: presentation.icon ?? null,
    validationHints: presentation.validationHints ?? null,
    presentation: row.presentation ?? {},
    labels: row.labels ?? [{ locale: "pt-BR", label: row.label ?? fieldName }],
  };
}

/** MDP Field Dictionary list → Field Document (empresas pilot) */
export function dictionaryToFieldDocument(items = [], moduleId = "empresas", entityId = DEFAULT_FIELD_ENTITY_ID) {
  const customFields = (items ?? [])
    .filter((row) => row.source === "custom" || row.source === "virtual")
    .map((row) => mdpFieldToFieldNode(row, entityId))
    .sort((a, b) => (a.sortOrder ?? 0) - (b.sortOrder ?? 0));

  const byGroup = Object.groupBy(customFields, (f) => f.groupId ?? "group.main");

  const groups = Object.entries(byGroup).map(([groupId, fields]) => ({
    groupId,
    label: groupId === "group.main" ? "Campos personalizados" : groupId.replace("group.", "").replace(/_/g, " "),
    category: fields[0]?.category ?? "geral",
    fields,
  }));

  if (!groups.length) {
    groups.push({ groupId: "group.main", label: "Campos personalizados", category: "geral", fields: [] });
  }

  return createEmptyFieldDocument({
    documentId: `${moduleId}.field.${entityId}`,
    moduleId,
    entityId,
    metadata: {
      label: "Field Studio",
      status: "draft",
      fieldCount: customFields.length,
      smartAuthoring: true,
    },
    groups,
  });
}

export default dictionaryToFieldDocument;
