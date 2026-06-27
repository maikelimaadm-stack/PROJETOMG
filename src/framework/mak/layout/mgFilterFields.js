import campoEngine from "@/framework/cadastro/fields/campoEngine";

/**
 * Campos do lançamento disponíveis como pills na faixa inferior.
 * @param {object[]} [camposPersonalizados]
 * @param {object[]} [nativeColumns] — colunas nativas do módulo (metadata.table.columns)
 */
export function buildMgFilterFields(camposPersonalizados = [], nativeColumns = []) {
  const native = nativeColumns.map((col) => ({
    key: col.id,
    label: col.label,
    column: col.id,
    filtravel: col.filtravel !== false,
    columnMeta: col,
  }));

  const custom = camposPersonalizados
    .map((campo) => campoEngine.normalize(campo))
    .filter((campo) => campo?.ativo !== false && campo.visivel_form !== false && campo.filtravel !== false)
    .map((campo) => ({
      key: `custom:${campo.field_name}`,
      label: campo.label || campo.nome,
      column: `custom:${campo.field_name}`,
      filtravel: true,
      customField: campo.field_name,
      campoMeta: {
        ...campo,
        id: `custom:${campo.field_name}`,
        customField: campo.field_name,
      },
    }));

  const seen = new Set();
  return [...native, ...custom].filter((field) => {
    if (seen.has(field.key)) return false;
    seen.add(field.key);
    return field.filtravel !== false;
  });
}

export function buildPanelFilterColumnMap(filterFields = []) {
  return filterFields.reduce((acc, field) => {
    acc[field.key] = field.column || field.key;
    return acc;
  }, {});
}

/** @deprecated use metadata.filters.sidebar — mantido para compat legada */
export const MG_FILTER_FIELDS = [];

/** @deprecated use metadata.filters.sidebar */
export const MG_FILTER_TEXT_FIELDS = [];

/** @deprecated use metadata.filters.sidebar */
export const MG_FILTER_SIDEBAR_FIELDS = [];

/** @deprecated use metadata.filters.sidebar.statusField */
export const MG_FILTER_STATUS_FIELD = {
  key: "status",
  label: "Status",
  column: "status",
};
