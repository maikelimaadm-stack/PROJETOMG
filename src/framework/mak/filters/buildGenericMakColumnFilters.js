/**
 * Filtros de coluna genéricos — Foundation (sem lógica específica de Empresas).
 */
export function buildGenericMakColumnFilters(filtrosColunas = {}) {
  const filters = {};

  Object.entries(filtrosColunas || {}).forEach(([columnId, draft]) => {
    if (!draft) return;
    const values = Array.isArray(draft) ? draft : draft.valores || draft.values || [];
    if (!Array.isArray(values) || values.length === 0) return;

    if (values.length === 1) {
      filters[columnId] = values[0];
      return;
    }
    filters[`${columnId}__in`] = values;
  });

  return Object.keys(filters).length > 0 ? filters : undefined;
}

export function mergeGenericMakListFilters(...parts) {
  const merged = {};
  parts.forEach((part) => {
    if (!part || typeof part !== "object") return;
    Object.assign(merged, part);
  });
  return Object.keys(merged).length > 0 ? merged : undefined;
}
