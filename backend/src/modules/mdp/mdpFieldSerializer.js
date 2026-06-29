import { DEFAULT_LOCALE } from "./mdpFieldConstants.js";

export const serializeMdpField = (row) => {
  if (!row) return null;
  const defaultLabel =
    row.labels?.find((l) => l.locale === DEFAULT_LOCALE) || row.labels?.[0] || null;
  return {
    id: row.id,
    fieldId: row.field_id,
    entityRowId: row.entity_row_id,
    entityId: row.entity?.entity_id ?? null,
    moduleId: row.entity?.module_id ?? null,
    fieldName: row.field_name,
    source: row.source,
    fieldType: row.field_type,
    scope: row.scope,
    clienteId: row.cliente_id,
    codigo: row.codigo,
    idGlobal: row.id_global,
    active: row.active,
    required: row.required,
    readOnly: row.read_only,
    searchable: row.searchable,
    filterable: row.filterable,
    exportable: row.exportable,
    auditable: row.auditable,
    visibleForm: row.visible_form,
    visibleTable: row.visible_table,
    visibleReport: row.visible_report,
    empresaApplicability: row.empresa_applicability,
    placeholder: row.placeholder,
    formula: row.formula,
    calculationBuilder: row.calculation_builder,
    useMask: row.use_mask,
    maskText: row.mask_text,
    useDecimal: row.use_decimal,
    decimalPlaces: row.decimal_places,
    decimalSeparator: row.decimal_separator,
    thousandSeparator: row.thousand_separator,
    tableOrder: row.table_order,
    columnWidth: row.column_width,
    relationEntity: row.relation_entity,
    optionsLabelField: row.options_label_field,
    optionsValueField: row.options_value_field,
    validationRef: row.validation_ref,
    formulaRef: row.formula_ref,
    relationshipRef: row.relationship_ref,
    presentation: row.presentation,
    legacyCampoId: row.legacy_campo_id,
    baseTemplateId: row.base_template_id,
    lifecycle: row.lifecycle,
    sortOrder: row.sort_order,
    versionId: row.version_id,
    labels: (row.labels || []).map((label) => ({
      locale: label.locale,
      label: label.label,
      description: label.description,
      helpText: label.help_text,
      placeholder: label.placeholder,
    })),
    label: defaultLabel?.label || row.field_name,
    options: (row.options || []).map((o) => ({
      id: o.id,
      code: o.code,
      label: o.label,
      sortOrder: o.sort_order,
      active: o.active,
    })),
    telaIds: (row.telas || []).map((t) => t.tela_id),
    telas: (row.telas || []).map((t) => t.tela).filter(Boolean),
    empresaIds: (row.empresa_scopes || []).map((s) => s.empresa_id),
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
};

export const serializeMdpFieldListItem = (row) => {
  const full = serializeMdpField(row);
  if (!full) return null;
  return {
    id: full.id,
    fieldId: full.fieldId,
    entityId: full.entityId,
    fieldName: full.fieldName,
    source: full.source,
    fieldType: full.fieldType,
    scope: full.scope,
    label: full.label,
    active: full.active,
    required: full.required,
    lifecycle: full.lifecycle,
    baseTemplateId: full.baseTemplateId,
  };
};
