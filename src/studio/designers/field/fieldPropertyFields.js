/** Property Grid field definitions for a selected Field Document node */

export function buildFieldPropertyFields(field) {
  if (!field) return [];
  const readOnlyName = Boolean(field.mdpRowId && field.source !== "virtual");
  const isNumeric = field.fieldType === "number" || field.fieldType === "decimal";

  const fields = [
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
    { propertyId: "category", label: "Categoria", type: "string", value: field.category ?? "", group: "Organização" },
    { propertyId: "groupId", label: "Grupo", type: "string", value: field.groupId ?? "group.main", group: "Organização" },
    { propertyId: "placeholder", label: "Placeholder", type: "string", value: field.placeholder ?? "", group: "Apresentação" },
    { propertyId: "helpText", label: "Texto de ajuda", type: "string", value: field.helpText ?? "", group: "Apresentação" },
    { propertyId: "defaultValue", label: "Valor padrão", type: "string", value: field.defaultValue ?? "", group: "Apresentação" },
    { propertyId: "useMask", label: "Usar máscara", type: "boolean", value: Boolean(field.useMask), group: "Máscara" },
    { propertyId: "maskText", label: "Máscara", type: "string", value: field.maskText ?? "", group: "Máscara" },
    { propertyId: "required", label: "Obrigatório", type: "boolean", value: Boolean(field.required), group: "Validação" },
    { propertyId: "minValue", label: "Mínimo", type: "number", value: field.minValue ?? "", group: "Validação" },
    { propertyId: "maxValue", label: "Máximo", type: "number", value: field.maxValue ?? "", group: "Validação" },
  ];

  if (isNumeric) {
    fields.push(
      { propertyId: "precision", label: "Precisão", type: "number", value: field.precision ?? "", group: "Numérico" },
      { propertyId: "scale", label: "Escala", type: "number", value: field.scale ?? "", group: "Numérico" }
    );
  }

  if (field.smartTemplateId) {
    fields.push({
      propertyId: "smartTemplateId",
      label: "Template inteligente",
      type: "string",
      value: field.smartTemplateId,
      group: "Meta",
      readOnly: true,
    });
  }

  if (field.businessTypeId) {
    fields.push({
      propertyId: "businessTypeId",
      label: "Business Type",
      type: "string",
      value: field.businessTypeId,
      group: "Meta",
      readOnly: true,
    });
  }

  fields.push(
    {
      propertyId: "expressionSource",
      label: "Fórmula (preview)",
      type: "string",
      value: field.expressionSource ?? field.presentation?.expressionDraft ?? "",
      group: "Fórmula",
      readOnly: true,
    },
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
    { propertyId: "active", label: "Ativo", type: "boolean", value: field.active !== false, group: "Flags" }
  );

  return fields;
}

export function buildFieldExplorerTree(fieldDocument) {
  const groups = fieldDocument?.groups ?? [];
  return groups.map((group) => ({
    entryId: group.groupId,
    entryType: "field-group",
    label: group.label ?? group.groupId,
    children: (group.fields ?? [])
      .filter((f) => !f._pendingDelete)
      .map((f) => ({
        entryId: f.fieldNodeId,
        entryType: "field",
        label: f.label ?? f.fieldName,
        metadata: { category: f.category, templateId: f.smartTemplateId },
      })),
  }));
}

/** Collect all active fields across groups */
export function collectActiveFields(document) {
  return (document?.groups ?? []).flatMap((g) => (g.fields ?? []).filter((f) => !f._pendingDelete));
}

/** Apply MDP sync results back into a Field Document clone */
export function applyFieldSyncResults(document, syncResults = []) {
  const groups = (document.groups ?? []).map((group) => {
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

    return { ...group, fields };
  });

  return { ...document, groups };
}

export default buildFieldPropertyFields;
