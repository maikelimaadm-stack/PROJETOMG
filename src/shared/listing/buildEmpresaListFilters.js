import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";
import {
  mapEmpresaColumnIdToFilterKey,
  normalizeEmpresaColumnFilterValue,
} from "@/shared/listing/normalizeEmpresaColumnFilter";

const STATUS_PANEL_MAP = {
  Ativo: "Ativa",
  Inativo: "Inativa",
  Ativa: "Ativa",
  Inativa: "Inativa",
};

const normalizePanelFilterValues = (values) =>
  (Array.isArray(values) ? values : [values])
    .map((item) => String(item).trim())
    .filter(Boolean);

/** Converte filtros do painel lateral/pills em payload `filters` da API de empresas. */
export function buildEmpresaPanelFilters(filterValues = {}) {
  const filters = {};

  const setArrayFilter = (apiKey, values, { normalizeValue } = {}) => {
    const normalized = normalizePanelFilterValues(values)
      .map((item) => (normalizeValue ? normalizeValue(item) : normalizeSearchQuery(String(item))))
      .filter((item) => item != null && item !== "");
    if (normalized.length === 0) return;
    if (normalized.length === 1) {
      filters[apiKey] = normalized[0];
      return;
    }
    filters[`${apiKey}__in`] = normalized;
  };

  Object.entries(filterValues || {}).forEach(([key, rawValues]) => {
    const values = normalizePanelFilterValues(rawValues);
    if (values.length === 0) return;

    if (key === "status") {
      const mapped = values.map((item) => STATUS_PANEL_MAP[item] || item).filter(Boolean);
      if (mapped.length === 1) {
        filters.status = mapped[0];
      } else if (mapped.length > 1) {
        filters.status__in = mapped;
      }
      return;
    }

    if (key.startsWith("custom:")) {
      setArrayFilter(key, values, {
        normalizeValue: (item) => normalizeSearchQuery(String(item)),
      });
      return;
    }

    const apiKey =
      key === "cnpj" ? "cpf_cnpj" : key === "uf" ? "estado" : key;

    if (apiKey === "tipo_vinculo" || apiKey === "codempresa" || apiKey === "id_global") {
      setArrayFilter(apiKey, values, {
        normalizeValue: (item) => normalizeEmpresaColumnFilterValue(apiKey, item),
      });
      return;
    }

    setArrayFilter(apiKey, values);
  });

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
