import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";
import {
  mapEmpresaColumnIdToFilterKey,
  normalizeEmpresaColumnFilterValue,
} from "@/shared/listing/normalizeEmpresaColumnFilter";
import { isErpFilterActive } from "@/shared/filters";
import {
  getPredecessorFilterOrderKeys,
} from "@/shared/filters/erpFilterApplyOrder";

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

function extractFilterPayload(filterEntry) {
  if (!filterEntry) return { values: [], operator: "", value: "", valueTo: "" };
  if (Array.isArray(filterEntry)) {
    return { values: normalizePanelFilterValues(filterEntry), operator: "", value: "", valueTo: "" };
  }
  if (typeof filterEntry !== "object") {
    const text = String(filterEntry).trim();
    return text ? { values: [text], operator: "", value: "", valueTo: "" } : { values: [], operator: "", value: "", valueTo: "" };
  }
  return {
    values: normalizePanelFilterValues(filterEntry.values),
    operator: String(filterEntry.operator || "").trim(),
    value: filterEntry.value != null ? String(filterEntry.value).trim() : "",
    valueTo: filterEntry.valueTo != null ? String(filterEntry.valueTo).trim() : "",
  };
}

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

  Object.entries(filterValues || {}).forEach(([key, rawFilter]) => {
    if (!isErpFilterActive(rawFilter)) return;

    const { values, operator, value } = extractFilterPayload(rawFilter);
    const effectiveValues = values.length > 0 ? values : value ? [value] : [];

    if (key === "status") {
      const mapped = effectiveValues.map((item) => STATUS_PANEL_MAP[item] || item).filter(Boolean);
      if (mapped.length === 1) {
        filters.status = mapped[0];
      } else if (mapped.length > 1) {
        filters.status__in = mapped;
      }
      return;
    }

    if (key.startsWith("custom:")) {
      setArrayFilter(key, effectiveValues, {
        normalizeValue: (item) => normalizeSearchQuery(String(item)),
      });
      return;
    }

    const apiKey = key === "cnpj" ? "cpf_cnpj" : key === "uf" ? "estado" : key;

    if (apiKey === "tipo_vinculo" || apiKey === "codempresa" || apiKey === "id_global") {
      setArrayFilter(apiKey, effectiveValues, {
        normalizeValue: (item) => normalizeEmpresaColumnFilterValue(apiKey, item),
      });
      return;
    }

    if (effectiveValues.length > 1) {
      setArrayFilter(apiKey, effectiveValues);
      return;
    }

    if (effectiveValues.length === 1) {
      filters[apiKey] = normalizeSearchQuery(String(effectiveValues[0]));
      return;
    }

    if (value && (!operator || operator === "equals" || operator === "contains")) {
      filters[apiKey] = normalizeSearchQuery(String(value));
    }
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
    const { operator, value, valueTo, values: listValues } = extractFilterPayload(values);
    const normalizedList = listValues
      .map((item) => normalizeEmpresaColumnFilterValue(key, item))
      .filter((item) => item != null && item !== "");
    if (normalizedList.length > 1) {
      filters[`${filterKey}__in`] = normalizedList;
      return;
    }
    if (normalizedList.length === 1) {
      filters[filterKey] = normalizedList[0];
      return;
    }
    const primary = value || "";
    if (!primary) return;
    const normalizedValue = normalizeEmpresaColumnFilterValue(key, primary);
    if (normalizedValue == null || normalizedValue === "") return;
    if (!operator || operator === "equals" || operator === "contains") {
      filters[filterKey] = normalizedValue;
    }
    if (operator === "between" && valueTo) {
      // Intervalos avançados permanecem no cliente por enquanto.
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

function isEmpresaFilterOrderKeyActive(key, appliedPanelValues = {}, columnFilters = {}, panelFilterColumnMap = {}) {
  if (key.startsWith("col:")) {
    return isErpFilterActive(columnFilters[key.slice(4)]);
  }
  if (isErpFilterActive(appliedPanelValues[key])) return true;
  const mappedColumn = panelFilterColumnMap[key];
  return mappedColumn ? isErpFilterActive(columnFilters[mappedColumn]) : false;
}

/** Filtros da API só dos predecessores na cadeia (vazio = lista completa do escopo). */
export function buildPredecessorEmpresaListFilters({
  filterApplyOrder = [],
  currentOrderKey,
  appliedPanelValues = {},
  columnFilters = {},
  panelFilterColumnMap = {},
} = {}) {
  const currentKey = String(currentOrderKey || "").trim();
  if (!currentKey) return undefined;

  const isOrderKeyActive = (key) =>
    isEmpresaFilterOrderKeyActive(key, appliedPanelValues, columnFilters, panelFilterColumnMap);

  const predecessors = getPredecessorFilterOrderKeys(filterApplyOrder, currentKey, isOrderKeyActive);
  if (predecessors.length === 0) return undefined;

  const partialPanel = {};
  const partialColumn = {};

  predecessors.forEach((key) => {
    if (key.startsWith("col:")) {
      const columnId = key.slice(4);
      if (isErpFilterActive(columnFilters[columnId])) {
        partialColumn[columnId] = columnFilters[columnId];
      }
      return;
    }

    if (isErpFilterActive(appliedPanelValues[key])) {
      partialPanel[key] = appliedPanelValues[key];
      return;
    }

    const mappedColumn = panelFilterColumnMap[key];
    if (mappedColumn && isErpFilterActive(columnFilters[mappedColumn])) {
      partialColumn[mappedColumn] = columnFilters[mappedColumn];
    }
  });

  return mergeEmpresaListFilters(
    buildEmpresaPanelFilters(partialPanel),
    buildEmpresaColumnFilters(partialColumn)
  );
}

export function resolveEmpresaDistinctColumnParam(columnId, panelFilterColumnMap = {}) {
  const mapped = panelFilterColumnMap[columnId];
  if (mapped) return mapEmpresaColumnIdToFilterKey(mapped);
  return mapEmpresaColumnIdToFilterKey(columnId);
}
