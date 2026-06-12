/** Converte filtros de coluna da tabela CADCPS em payload da API. */
export function buildCadcpsColumnFilters(filtrosColunas = {}) {
  const filters = {};

  const mapKey = {
    codigo: "codigo",
    nome: "nome",
    tipo: "tipo",
    field_name: "field_name",
    ativo: "ativo",
    obrigatorio: "obrigatorio",
    aplicacao_modo: "aplicacao_modo",
    id_global: "id_global",
  };

  Object.entries(filtrosColunas).forEach(([key, values]) => {
    if (!Array.isArray(values) || values.length === 0) return;
    const apiKey = mapKey[key] || key;

    if (apiKey === "ativo" || apiKey === "obrigatorio") {
      if (values.length === 1) {
        filters[apiKey] = values[0] === "Sim" || values[0] === true || values[0] === "true";
      }
      return;
    }

    if (values.length === 1) {
      filters[apiKey] = values[0];
      return;
    }
    filters[`${apiKey}__in`] = values;
  });

  return Object.keys(filters).length > 0 ? filters : undefined;
}

export function mergeCadcpsListFilters(...parts) {
  const merged = {};
  parts.forEach((part) => {
    if (!part) return;
    Object.assign(merged, part);
  });
  return Object.keys(merged).length > 0 ? merged : undefined;
}
