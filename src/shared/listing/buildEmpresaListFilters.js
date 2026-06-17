import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";
import {
  mapEmpresaColumnIdToFilterKey,
  normalizeEmpresaColumnFilterValue,
} from "@/shared/listing/normalizeEmpresaColumnFilter";

const STATUS_PANEL_MAP = {
  Ativo: "Ativa",
  Inativo: "Inativa",
};

/** Converte filtros do painel lateral em payload `filters` da API de empresas. */
export function buildEmpresaPanelFilters(filterValues = {}) {
  const filters = {};

  const setArrayFilter = (apiKey, values) => {
    const normalized = (Array.isArray(values) ? values : [values])
      .map((item) => normalizeSearchQuery(String(item)))
      .filter(Boolean);
    if (normalized.length === 0) return;
    if (normalized.length === 1) {
      filters[apiKey] = normalized[0];
      return;
    }
    filters[`${apiKey}__in`] = normalized;
  };

  setArrayFilter("razao_social", filterValues.razao_social);
  setArrayFilter("nome_fantasia", filterValues.nome_fantasia);
  setArrayFilter("cpf_cnpj", filterValues.cnpj);
  setArrayFilter("telefone", filterValues.telefone);
  setArrayFilter("cidade", filterValues.cidade);
  setArrayFilter("estado", filterValues.uf);

  const statusValues = filterValues.status;
  if (Array.isArray(statusValues) && statusValues.length > 0) {
    const mapped = statusValues.map((item) => STATUS_PANEL_MAP[item] || item).filter(Boolean);
    if (mapped.length === 1) {
      filters.status = mapped[0];
    } else if (mapped.length > 1) {
      filters.status__in = mapped;
    }
  }

  return Object.keys(filters).length > 0 ? filters : undefined;
}

/** Converte filtros de coluna da tabela (valores únicos) em payload da API. */
export function buildEmpresaColumnFilters(filtrosColunas = {}) {
  const filters = {};

  Object.entries(filtrosColunas).forEach(([key, values]) => {
    const filterKey = mapEmpresaColumnIdToFilterKey(key);
    if (Array.isArray(values)) {
      if (values.length === 0) return;
      const normalized = values
        .map((value) => normalizeEmpresaColumnFilterValue(key, value))
        .filter((value) => value != null && value !== "");
      if (normalized.length === 0) return;
      if (normalized.length === 1) {
        filters[filterKey] = normalized[0];
        return;
      }
      filters[`${filterKey}__in`] = normalized;
      return;
    }

    if (!values || typeof values !== "object") return;
    const operator = String(values.operator || "").trim();
    const rawValue = values.value;
    const rawValues = Array.isArray(values.values) ? values.values : [];
    const normalizedList = rawValues
      .map((value) => normalizeEmpresaColumnFilterValue(key, value))
      .filter((value) => value != null && value !== "");
    if (normalizedList.length > 1) {
      filters[`${filterKey}__in`] = normalizedList;
      return;
    }
    if (normalizedList.length === 1) {
      filters[filterKey] = normalizedList[0];
      return;
    }
    if (rawValue == null || rawValue === "") return;
    const normalizedValue = normalizeEmpresaColumnFilterValue(key, rawValue);
    if (normalizedValue == null || normalizedValue === "") return;
    // A API de listagem ainda suporta apenas equals/contains (e __in).
    // Para operadores avançados, mantemos o filtro no cliente.
    if (!operator || operator === "equals" || operator === "contains") {
      filters[filterKey] = normalizedValue;
    }
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
