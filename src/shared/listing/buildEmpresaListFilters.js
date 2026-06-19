import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";
import {
  mapEmpresaColumnIdToFilterKey,
  normalizeEmpresaColumnFilterValue,
} from "@/shared/listing/normalizeEmpresaColumnFilter";
import { isErpFilterActive } from "@/shared/filters";

const STATUS_PANEL_MAP = {
  Ativo: "Ativa",
  Inativo: "Inativa",
  Ativa: "Ativa",
  Inativa: "Inativa",
};

const NUMERIC_ADVANCED_OPERATORS = new Set(["gt", "gte", "lt", "lte", "between", "not_between"]);
const DATE_ADVANCED_OPERATORS = new Set([
  "equals",
  "before",
  "after",
  "between",
  "today",
  "yesterday",
  "this_month",
  "last_month",
]);

const normalizePanelFilterValues = (values) =>
  (Array.isArray(values) ? values : [values])
    .map((item) => String(item).trim())
    .filter(Boolean);

const normalizeDateFilterInput = (value) => {
  const text = String(value ?? "").trim();
  if (!text) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(text)) {
    const [day, month, year] = text.split("/");
    return `${year}-${month}-${day}`;
  }
  if (/^\d{4}-\d{2}-\d{2}/.test(text)) {
    return text.slice(0, 10);
  }
  return text;
};

const normalizeFilterScalarValue = ({ key, filterType, value }) => {
  if (value == null || value === "") return "";
  if (filterType === "date") return normalizeDateFilterInput(value);
  if (filterType === "number" || filterType === "money" || key === "codempresa" || key === "id_global") {
    const normalized = normalizeEmpresaColumnFilterValue(key, value);
    return normalized == null ? "" : normalized;
  }
  return normalizeSearchQuery(String(value));
};

const buildOperatorFilterKey = ({ filterKey, operator, filterType }) => {
  const customField = String(filterKey || "").startsWith("custom:");
  if (!customField) {
    return `${filterKey}__${operator}`;
  }
  if (filterType === "date") {
    return `${filterKey}__date_${operator}`;
  }
  if (filterType === "number" || filterType === "money") {
    return `${filterKey}__num_${operator}`;
  }
  return null;
};

const applyAdvancedOperatorFilter = ({
  filters,
  filterKey,
  filterType,
  operator,
  value,
  valueTo,
}) => {
  const op = String(operator || "").trim();
  if (!op) return false;

  if (NUMERIC_ADVANCED_OPERATORS.has(op)) {
    if (!(filterType === "number" || filterType === "money" || filterKey === "codempresa" || filterKey === "id_global")) {
      return false;
    }
    const opKey = buildOperatorFilterKey({ filterKey, operator: op, filterType });
    if (!opKey) return false;
    const primary = normalizeFilterScalarValue({ key: filterKey, filterType, value });
    const secondary = normalizeFilterScalarValue({ key: filterKey, filterType, value: valueTo });
    if (op === "between" || op === "not_between") {
      if (primary === "" && secondary === "") return false;
      filters[opKey] = { from: primary === "" ? null : primary, to: secondary === "" ? null : secondary };
      return true;
    }
    if (primary === "") return false;
    filters[opKey] = primary;
    return true;
  }

  if (DATE_ADVANCED_OPERATORS.has(op)) {
    if (filterType !== "date") return false;
    const opKey = buildOperatorFilterKey({ filterKey, operator: op, filterType });
    if (!opKey) return false;
    if (op === "today" || op === "yesterday" || op === "this_month" || op === "last_month") {
      filters[opKey] = true;
      return true;
    }
    const primary = normalizeFilterScalarValue({ key: filterKey, filterType, value });
    const secondary = normalizeFilterScalarValue({ key: filterKey, filterType, value: valueTo });
    if (op === "between") {
      if (primary === "" && secondary === "") return false;
      filters[opKey] = { from: primary === "" ? null : primary, to: secondary === "" ? null : secondary };
      return true;
    }
    if (primary === "") return false;
    filters[opKey] = primary;
    return true;
  }

  return false;
};

function extractFilterPayload(filterEntry) {
  if (!filterEntry) return { values: [], operator: "", value: "", valueTo: "", type: "" };
  if (Array.isArray(filterEntry)) {
    return { values: normalizePanelFilterValues(filterEntry), operator: "", value: "", valueTo: "", type: "" };
  }
  if (typeof filterEntry !== "object") {
    const text = String(filterEntry).trim();
    return text
      ? { values: [text], operator: "", value: "", valueTo: "", type: "" }
      : { values: [], operator: "", value: "", valueTo: "", type: "" };
  }
  return {
    values: normalizePanelFilterValues(filterEntry.values),
    operator: String(filterEntry.operator || "").trim(),
    value: filterEntry.value != null ? String(filterEntry.value).trim() : "",
    valueTo: filterEntry.valueTo != null ? String(filterEntry.valueTo).trim() : "",
    type: String(filterEntry.type || "").trim(),
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

    const { values, operator, value, valueTo, type } = extractFilterPayload(rawFilter);
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
      const usedAdvancedOperator = applyAdvancedOperatorFilter({
        filters,
        filterKey: key,
        filterType: type,
        operator,
        value,
        valueTo,
      });
      if (usedAdvancedOperator) return;
      setArrayFilter(key, effectiveValues, {
        normalizeValue: (item) => normalizeFilterScalarValue({ key, filterType: type, value: item }),
      });
      return;
    }

    const apiKey = key === "cnpj" ? "cpf_cnpj" : key === "uf" ? "estado" : key;

    if (apiKey === "tipo_vinculo" || apiKey === "codempresa" || apiKey === "id_global") {
      setArrayFilter(apiKey, effectiveValues, {
        normalizeValue: (item) => normalizeFilterScalarValue({ key: apiKey, filterType: type, value: item }),
      });
      return;
    }

    const usedAdvancedOperator = applyAdvancedOperatorFilter({
      filters,
      filterKey: apiKey,
      filterType: type,
      operator,
      value,
      valueTo,
    });
    if (usedAdvancedOperator) return;

    if (effectiveValues.length > 1) {
      setArrayFilter(apiKey, effectiveValues);
      return;
    }

    if (effectiveValues.length === 1) {
      filters[apiKey] = normalizeSearchQuery(String(effectiveValues[0]));
      return;
    }

    if (value && (!operator || operator === "equals" || operator === "contains")) {
      filters[apiKey] = normalizeFilterScalarValue({ key: apiKey, filterType: type, value });
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
    const { operator, value, valueTo, values: listValues, type } = extractFilterPayload(values);
    const normalizedList = listValues
      .map((item) => normalizeFilterScalarValue({ key, filterType: type, value: item }))
      .filter((item) => item != null && item !== "");
    if (normalizedList.length > 1) {
      filters[`${filterKey}__in`] = normalizedList;
      return;
    }
    if (normalizedList.length === 1) {
      filters[filterKey] = normalizedList[0];
      return;
    }
    const usedAdvancedOperator = applyAdvancedOperatorFilter({
      filters,
      filterKey,
      filterType: type,
      operator,
      value,
      valueTo,
    });
    if (usedAdvancedOperator) return;

    const primary = value || "";
    if (!primary) return;
    const normalizedValue = normalizeFilterScalarValue({ key, filterType: type, value: primary });
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
