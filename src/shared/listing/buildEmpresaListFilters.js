import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

const STATUS_PANEL_MAP = {
  Ativo: "Ativa",
  Inativo: "Inativa",
};

/** Converte filtros do painel lateral em payload `filters` da API de empresas. */
export function buildEmpresaPanelFilters(filterValues = {}, filterStatus = "Todos") {
  const filters = {};

  const razao = normalizeSearchQuery(filterValues.razao_social);
  if (razao) filters.razao_social = razao;

  const fantasia = normalizeSearchQuery(filterValues.nome_fantasia);
  if (fantasia) filters.nome_fantasia = fantasia;

  const doc = normalizeSearchQuery(filterValues.cnpj);
  if (doc) filters.cpf_cnpj = doc;

  const telefone = normalizeSearchQuery(filterValues.telefone);
  if (telefone) filters.telefone = telefone;

  const cidade = normalizeSearchQuery(filterValues.cidade);
  if (cidade) filters.cidade = cidade;

  const uf = normalizeSearchQuery(filterValues.uf);
  if (uf) filters.estado = uf;

  if (filterStatus && filterStatus !== "Todos") {
    filters.status = STATUS_PANEL_MAP[filterStatus] || filterStatus;
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

/** Converte filtros de coluna da tabela (valores únicos) em payload da API. */
export function buildEmpresaColumnFilters(filtrosColunas = {}) {
  const filters = {};

  Object.entries(filtrosColunas).forEach(([key, values]) => {
    if (!Array.isArray(values) || values.length === 0) return;
    if (values.length === 1) {
      filters[key] = values[0];
      return;
    }
    filters[`${key}__in`] = values;
  });

  return Object.keys(filters).length > 0 ? filters : undefined;
}

export function mergeEmpresaListFilters(...parts) {
  const merged = {};
  parts.forEach((part) => {
    if (!part) return;
    Object.assign(merged, part);
  });
  return Object.keys(merged).length > 0 ? merged : undefined;
}
