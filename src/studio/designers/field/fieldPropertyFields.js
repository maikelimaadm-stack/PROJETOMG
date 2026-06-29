/** Property Grid field definitions for a selected Field Document node */

export function buildFieldPropertyFields(field) {
  if (!field) return [];
  const readOnlyName = Boolean(field.mdpRowId && field.source !== "virtual");
  return [
    { propertyId: "label", label: "Rótulo", type: "string", value: field.label ?? "", group: "Campo" },
    {
      propertyId: "fieldName",
      label: "Nome técnico",
      type: "string",
      value: field.fieldName ?? "",
      group: "Campo",
      readOnly: readOnlyName,
    },
    { propertyId: "fieldType", label: "Tipo", type: "string", value: field.fieldType ?? "string", group: "Campo" },
    { propertyId: "required", label: "Obrigatório", type: "boolean", value: Boolean(field.required), group: "Flags" },
    { propertyId: "readOnly", label: "Somente leitura", type: "boolean", value: Boolean(field.readOnly), group: "Flags" },
    {
      propertyId: "visibleForm",
      label: "Visível no formulário",
      type: "boolean",
      value: field.visibleForm !== false,
      group: "Visibilidade",
    },
    {
      propertyId: "visibleTable",
      label: "Visível na tabela",
      type: "boolean",
      value: Boolean(field.visibleTable),
      group: "Visibilidade",
    },
    { propertyId: "active", label: "Ativo", type: "boolean", value: field.active !== false, group: "Flags" },
  ];
}

export function buildFieldExplorerTree(fieldDocument) {
  const fields = fieldDocument?.groups?.[0]?.fields?.filter((f) => !f._pendingDelete) ?? [];
  return [
    {
      entryId: fieldDocument?.documentId ?? "field.draft",
      entryType: "field_config",
      label: fieldDocument?.metadata?.label ?? "Campos",
      children: fields.map((f) => ({
        entryId: f.fieldNodeId,
        entryType: "field",
        label: f.label ?? f.fieldName,
      })),
    },
  ];
}

/** Apply MDP sync results back into a Field Document clone */
export function applyFieldSyncResults(document, syncResults = []) {
  const group = document.groups?.[0];
  if (!group) return document;

  let fields = [...(group.fields ?? [])];
  const deletedIds = new Set(
    syncResults.filter((r) => r.action === "delete" && r.ok !== false).map((r) => r.id)
  );

  fields = fields.filter((f) => !(f._pendingDelete && f.mdpRowId && deletedIds.has(f.mdpRowId)));

  syncResults.forEach((result) => {
    if (result.action !== "create" || !result.result) return;
    const row = result.result?.data ?? result.result;
    const idx = fields.findIndex((f) => f.fieldName === result.fieldName && f._pendingCreate);
    if (idx < 0) return;
    fields[idx] = {
      ...fields[idx],
      mdpRowId: row.id ?? row.fieldId ?? fields[idx].mdpRowId,
      fieldId: row.fieldId ?? fields[idx].fieldId,
      _pendingCreate: false,
    };
  });

  return {
    ...document,
    groups: [{ ...group, fields }],
  };
}

export default buildFieldPropertyFields;
