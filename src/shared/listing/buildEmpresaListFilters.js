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

const INVALID_LITERAL_VALUES = new Set(["undefined", "null"]);
const LIST_SELECTION_KEYS = ["values", "selectedValues", "checkedValues", "selected", "options"];
const NUMERIC_ADVANCED_OPERATORS = new Set([
  "not_equals",
  "gt",
  "gte",
  "lt",
  "lte",
  "between",
  "not_between",
]);
const DATE_ADVANCED_OPERATORS = new Set([
  "equals",
  "not_equals",
  "before",
  "after",
  "gt",
  "gte",
  "lt",
  "lte",
  "between",
  "not_between",
  "today",
  "yesterday",
  "this_month",
  "last_month",
]);

const sanitizeScalarFilterValue = (value) => {
  if (value == null) return "";
  const text = String(value).trim();
  if (!text) return "";
  if (INVALID_LITERAL_VALUES.has(text.toLowerCase())) return "";
  return text;
};

const extractOptionScalarValue = (value) => {
  if (value == null) return value;
  if (typeof value !== "object" || Array.isArray(value)) return value;
  const candidates = [
    value.value,
    value.id,
    value.key,
    value.code,
    value.codigo,
    value.label,
    value.nome,
    value.name,
  ];
  for (const candidate of candidates) {
    if (candidate != null && String(candidate).trim() !== "") return candidate;
  }
  return "";
};

const normalizePanelFilterValues = (values) =>
  (Array.isArray(values) ? values : values == null ? [] : [values])
    .map((item) => sanitizeScalarFilterValue(extractOptionScalarValue(item)))
    .filter(Boolean);

const extractSelectionValues = (filterEntry) => {
  if (!filterEntry || typeof filterEntry !== "object") return [];

  for (const key of LIST_SELECTION_KEYS) {
    const candidate = filterEntry[key];
    if (Array.isArray(candidate)) {
      const normalized = normalizePanelFilterValues(candidate);
      if (normalized.length > 0) return normalized;
      continue;
    }
    if (candidate && typeof candidate === "object") {
      const selectedValues = Object.entries(candidate).flatMap(([option, checked]) => {
        if (checked == null || checked === false) return [];
        if (checked === true) return [option];
        if (typeof checked === "object") {
          if (checked.checked === false || checked.selected === false) return [];
          const nested = extractOptionScalarValue(checked);
          return nested == null || String(nested).trim() === "" ? [option] : [nested];
        }
        return [option];
      });
      const normalized = normalizePanelFilterValues(selectedValues);
      if (normalized.length > 0) return normalized;
    }
  }

  return [];
};

const normalizeDateFilterInput = (value) => {
  const text = sanitizeScalarFilterValue(value);
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
  const sanitized = sanitizeScalarFilterValue(value);
  if (!sanitized) return "";
  const normalizedType = String(filterType || "").trim().toLowerCase();
  if (normalizedType === "date" || normalizedType === "datetime") return normalizeDateFilterInput(sanitized);
  if (key === "tipo_vinculo") {
    const mapped = normalizeEmpresaColumnFilterValue(key, sanitized);
    return mapped == null ? "" : mapped;
  }
  if (normalizedType === "number" || normalizedType === "money" || key === "codempresa" || key === "id_global") {
    const normalized = normalizeEmpresaColumnFilterValue(key, sanitized);
    if (typeof normalized === "number" && Number.isFinite(normalized)) return normalized;
    const fallback = Number(sanitized.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
    return Number.isFinite(fallback) ? fallback : "";
  }
  return normalizeSearchQuery(sanitized);
};

const buildOperatorFilterKey = ({ filterKey, operator, filterType }) => {
  const customField = String(filterKey || "").startsWith("custom:");
  const normalizedType = String(filterType || "").trim().toLowerCase();
  if (!customField) {
    return `${filterKey}__${operator}`;
  }
  if (normalizedType === "date" || normalizedType === "datetime") {
    return `${filterKey}__date_${operator}`;
  }
  if (normalizedType === "number" || normalizedType === "money") {
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
  const normalizedType = String(filterType || "").trim().toLowerCase();
  const isNumericField =
    normalizedType === "number" ||
    normalizedType === "money" ||
    filterKey === "codempresa" ||
    filterKey === "id_global";
  const isDateField = normalizedType === "date" || normalizedType === "datetime";

  if (DATE_ADVANCED_OPERATORS.has(op) && isDateField) {
    const opKey = buildOperatorFilterKey({ filterKey, operator: op, filterType });
    if (!opKey) return false;
    const primary = normalizeFilterScalarValue({ key: filterKey, filterType, value });
    const secondary = normalizeFilterScalarValue({ key: filterKey, filterType, value: valueTo });
    if (op === "today" || op === "yesterday" || op === "this_month" || op === "last_month") {
      filters[opKey] = true;
      return true;
    }
    if (op === "between" || op === "not_between") {
      if (primary === "" && secondary === "") return false;
      filters[opKey] = { from: primary === "" ? null : primary, to: secondary === "" ? null : secondary };
      return true;
    }
    if (primary === "") return false;
    filters[opKey] = primary;
    return true;
  }

  if (NUMERIC_ADVANCED_OPERATORS.has(op) && isNumericField) {
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

  return false;
};

function extractFilterPayload(filterEntry) {
  if (!filterEntry) return { values: [], operator: "", value: "", valueTo: "", type: "" };
  if (Array.isArray(filterEntry)) {
    return { values: normalizePanelFilterValues(filterEntry), operator: "", value: "", valueTo: "", type: "" };
  }
  if (typeof filterEntry !== "object") {
    const text = sanitizeScalarFilterValue(filterEntry);
    return text
      ? { values: [text], operator: "", value: "", valueTo: "", type: "" }
      : { values: [], operator: "", value: "", valueTo: "", type: "" };
  }
  const operator = String(filterEntry.operator || "").trim();
  const extractedValues = extractSelectionValues(filterEntry);
  const fallbackInValues =
    extractedValues.length === 0 && operator.toLowerCase() === "in"
      ? normalizePanelFilterValues(String(filterEntry.value || "").split(/[;,]/))
      : [];
  return {
    values: extractedValues.length > 0 ? extractedValues : fallbackInValues,
    operator,
    value: sanitizeScalarFilterValue(filterEntry.value),
    valueTo: sanitizeScalarFilterValue(filterEntry.valueTo),
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
      const normalized = normalizeFilterScalarValue({ key: apiKey, filterType: type, value: effectiveValues[0] });
      if (normalized === "" || normalized == null) return;
      filters[apiKey] = normalized;
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
    const normalizedList = [...new Set(listValues
      .map((item) => normalizeFilterScalarValue({ key, filterType: type, value: item }))
      .filter((item) => item != null && item !== ""))];
    if (normalizedList.length > 0) {
      // Regra oficial: seleção por lista (values/selectedValues/checkedValues) tem prioridade e vira IN.
      // Operador/valor da mesma coluna não é aplicado em paralelo.
      filters[`${filterKey}__in`] = normalizedList;
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
