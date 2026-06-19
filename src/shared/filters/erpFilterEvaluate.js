import { getErpDefaultOperator } from "@/shared/filters/erpFilterOperators";

export const parseDateFilterValue = (val) => {
  if (!val) return null;
  const s = String(val).split("T")[0];
  if (s.includes("/")) {
    const [dia, mes, ano] = s.split("/");
    if (!dia || !mes || !ano) return null;
    return new Date(Number(ano), Number(mes) - 1, Number(dia)).getTime();
  }
  const [ano, mes, dia] = s.split("-");
  if (!ano || !mes || !dia) return null;
  return new Date(Number(ano), Number(mes) - 1, Number(dia)).getTime();
};

export const parseNumberFilterValue = (val) => {
  const s = String(val ?? "").trim();
  if (!s) return NaN;
  return Number(s.replace(/[^\d,.-]/g, "").replace(/\./g, "").replace(",", "."));
};

export const parseMoneyFilterValue = (val) => parseNumberFilterValue(val);

const getStartOfDay = (dateLike) => {
  const base = dateLike ? new Date(dateLike) : new Date();
  return new Date(base.getFullYear(), base.getMonth(), base.getDate());
};

const getEndOfDay = (dateLike) => {
  const base = dateLike ? new Date(dateLike) : new Date();
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999);
};

const getWeekStart = (dateLike) => {
  const base = getStartOfDay(dateLike);
  const day = base.getDay();
  base.setDate(base.getDate() - day);
  return base;
};

const getWeekEnd = (dateLike) => {
  const start = getWeekStart(dateLike);
  const end = new Date(start);
  end.setDate(end.getDate() + 6);
  return getEndOfDay(end);
};

const getMonthStart = (dateLike) => {
  const base = dateLike ? new Date(dateLike) : new Date();
  return new Date(base.getFullYear(), base.getMonth(), 1);
};

const getMonthEnd = (dateLike) => {
  const base = dateLike ? new Date(dateLike) : new Date();
  return getEndOfDay(new Date(base.getFullYear(), base.getMonth() + 1, 0));
};

const getYearStart = (dateLike) => {
  const base = dateLike ? new Date(dateLike) : new Date();
  return new Date(base.getFullYear(), 0, 1);
};

const getYearEnd = (dateLike) => {
  const base = dateLike ? new Date(dateLike) : new Date();
  return getEndOfDay(new Date(base.getFullYear(), 11, 31));
};

const isEmptyValue = (rawValue, displayValue) => {
  const source = displayValue ?? rawValue;
  if (source == null) return true;
  const text = String(source).trim();
  return text === "" || text === "-";
};

const evaluateTextOperator = (operator, sourceValue, targetValue) => {
  const src = String(sourceValue || "").toLowerCase();
  const target = String(targetValue || "").toLowerCase();
  switch (operator) {
    case "contains":
      return !target || src.includes(target);
    case "not_contains":
      return !target || !src.includes(target);
    case "starts_with":
      return !target || src.startsWith(target);
    case "ends_with":
      return !target || src.endsWith(target);
    case "equals":
      return !target || src === target;
    case "not_equals":
      return !target || src !== target;
    case "is_empty":
      return isEmptyValue(sourceValue);
    case "is_not_empty":
      return !isEmptyValue(sourceValue);
    default:
      return true;
  }
};

const evaluateNumberOperator = (operator, sourceValue, targetValue, targetValueTo) => {
  if (operator === "is_empty") return isEmptyValue(sourceValue);
  if (operator === "is_not_empty") return !isEmptyValue(sourceValue);
  if (operator === "contains") {
    return evaluateTextOperator("contains", sourceValue, targetValue);
  }

  const source = Number(sourceValue);
  if (!Number.isFinite(source)) return false;
  const target = parseNumberFilterValue(targetValue);
  const targetTo = parseNumberFilterValue(targetValueTo);

  switch (operator) {
    case "equals":
      return Number.isFinite(target) ? source === target : true;
    case "not_equals":
      return Number.isFinite(target) ? source !== target : true;
    case "gt":
      return Number.isFinite(target) ? source > target : true;
    case "gte":
      return Number.isFinite(target) ? source >= target : true;
    case "lt":
      return Number.isFinite(target) ? source < target : true;
    case "lte":
      return Number.isFinite(target) ? source <= target : true;
    case "between": {
      if (!Number.isFinite(target) && !Number.isFinite(targetTo)) return true;
      if (Number.isFinite(target) && source < target) return false;
      if (Number.isFinite(targetTo) && source > targetTo) return false;
      return true;
    }
    case "not_between": {
      if (!Number.isFinite(target) && !Number.isFinite(targetTo)) return true;
      const inRange =
        (!Number.isFinite(target) || source >= target) &&
        (!Number.isFinite(targetTo) || source <= targetTo);
      return !inRange;
    }
    default:
      return true;
  }
};

const evaluateDateOperator = (operator, sourceValue, targetValue, targetValueTo) => {
  if (operator === "is_empty") return isEmptyValue(sourceValue);
  if (operator === "is_not_empty") return !isEmptyValue(sourceValue);
  if (operator === "contains") {
    return evaluateTextOperator("contains", sourceValue, targetValue);
  }

  const sourceTs = parseDateFilterValue(sourceValue);
  if (sourceTs === null) return false;

  const now = new Date();
  const todayStart = getStartOfDay(now).getTime();
  const todayEnd = getEndOfDay(now).getTime();

  switch (operator) {
    case "today":
      return sourceTs >= todayStart && sourceTs <= todayEnd;
    case "yesterday": {
      const yesterday = new Date(now);
      yesterday.setDate(now.getDate() - 1);
      return (
        sourceTs >= getStartOfDay(yesterday).getTime() &&
        sourceTs <= getEndOfDay(yesterday).getTime()
      );
    }
    case "this_week":
      return sourceTs >= getWeekStart(now).getTime() && sourceTs <= getWeekEnd(now).getTime();
    case "last_week": {
      const lastWeekRef = new Date(now);
      lastWeekRef.setDate(lastWeekRef.getDate() - 7);
      return (
        sourceTs >= getWeekStart(lastWeekRef).getTime() &&
        sourceTs <= getWeekEnd(lastWeekRef).getTime()
      );
    }
    case "this_month":
      return sourceTs >= getMonthStart(now).getTime() && sourceTs <= getMonthEnd(now).getTime();
    case "last_month": {
      const lastMonthRef = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      return (
        sourceTs >= getMonthStart(lastMonthRef).getTime() &&
        sourceTs <= getMonthEnd(lastMonthRef).getTime()
      );
    }
    case "this_year":
      return sourceTs >= getYearStart(now).getTime() && sourceTs <= getYearEnd(now).getTime();
    case "last_year": {
      const lastYearRef = new Date(now.getFullYear() - 1, 0, 1);
      return (
        sourceTs >= getYearStart(lastYearRef).getTime() &&
        sourceTs <= getYearEnd(lastYearRef).getTime()
      );
    }
    case "equals": {
      const targetTs = parseDateFilterValue(targetValue);
      if (targetTs === null) return true;
      return (
        sourceTs >= getStartOfDay(targetTs).getTime() &&
        sourceTs <= getEndOfDay(targetTs).getTime()
      );
    }
    case "before": {
      const targetTs = parseDateFilterValue(targetValue);
      if (targetTs === null) return true;
      return sourceTs < getStartOfDay(targetTs).getTime();
    }
    case "after": {
      const targetTs = parseDateFilterValue(targetValue);
      if (targetTs === null) return true;
      return sourceTs > getEndOfDay(targetTs).getTime();
    }
    case "between": {
      const startTs = parseDateFilterValue(targetValue);
      const endTs = parseDateFilterValue(targetValueTo);
      if (startTs !== null && sourceTs < getStartOfDay(startTs).getTime()) return false;
      if (endTs !== null && sourceTs > getEndOfDay(endTs).getTime()) return false;
      return true;
    }
    default:
      return true;
  }
};

const evaluateEnumOperator = (selectedValues, rawValue, displayValue) => {
  if (!Array.isArray(selectedValues) || selectedValues.length === 0) return true;
  const source = String(displayValue ?? rawValue ?? "");
  return selectedValues.some((option) => String(option) === source);
};

const evaluateBooleanOperator = (selectedValues, rawValue, displayValue) => {
  if (!Array.isArray(selectedValues) || selectedValues.length === 0) return true;
  const source = String(displayValue ?? rawValue ?? "").trim().toLowerCase();
  const normalized =
    source === "true" || source === "1" || source === "sim" || source === "s" || source === "yes";
  const asLabel = normalized ? "Sim" : "Não";
  return selectedValues.some((option) => {
    const opt = String(option).trim().toLowerCase();
    if (opt === "sim" || opt === "s") return normalized;
    if (opt === "não" || opt === "nao" || opt === "n") return !normalized;
    return String(option) === asLabel || String(option) === source;
  });
};

export function evaluateErpFilter({ filter, filterType, rawValue, displayValue }) {
  if (!filter || typeof filter !== "object") return true;

  const type = filterType || filter.type || "text";
  const operator = filter.operator || getErpDefaultOperator(type);
  const value = filter.value ?? "";
  const valueTo = filter.valueTo ?? "";
  const listValues = Array.isArray(filter.values) ? filter.values : [];

  if (type === "enum") {
    return evaluateEnumOperator(listValues, rawValue, displayValue);
  }

  if (type === "boolean") {
    return evaluateBooleanOperator(listValues, rawValue, displayValue);
  }

  if (listValues.length > 0) {
    const sourceValue = displayValue ?? rawValue ?? "";
    const matchesList = listValues.some((option) => String(option) === String(sourceValue));
    if (!matchesList) return false;
  }

  if (type === "number" || type === "money") {
    return evaluateNumberOperator(operator, rawValue, value, valueTo);
  }

  if (type === "date") {
    return evaluateDateOperator(operator, rawValue, value, valueTo);
  }

  return evaluateTextOperator(operator, displayValue ?? rawValue ?? "", value);
}

/** Alias de compatibilidade com TBLEMP. */
export function evaluateColumnFilter({ filterDraft, filterType, rawValue, displayValue }) {
  return evaluateErpFilter({
    filter: filterDraft,
    filterType,
    rawValue,
    displayValue,
  });
}

const SERVER_SUPPORTED_FILTER_OPERATORS = new Set([
  "equals",
  "contains",
  "gt",
  "gte",
  "lt",
  "lte",
  "between",
  "not_between",
  "before",
  "after",
  "today",
  "yesterday",
  "this_month",
  "last_month",
  "",
]);

export function filterNeedsClientSideProcessing(filterEntry) {
  if (!filterEntry) return false;
  if (Array.isArray(filterEntry)) return false;
  if (typeof filterEntry !== "object") return false;

  const operator = String(filterEntry.operator || "").trim() || "equals";
  const rawValues = Array.isArray(filterEntry.values) ? filterEntry.values : [];
  const hasPrimary = filterEntry.value != null && String(filterEntry.value).trim() !== "";
  const hasSecondary = filterEntry.valueTo != null && String(filterEntry.valueTo).trim() !== "";
  const hasListValues = rawValues.some((item) => item != null && String(item).trim() !== "");

  if (hasListValues && (filterEntry.type === "enum" || filterEntry.type === "boolean")) {
    return false;
  }
  if (hasListValues) return false;
  if (!hasPrimary && !hasSecondary && !operator.match(/^(today|yesterday|this_|last_|is_empty|is_not_empty)/)) {
    return false;
  }

  return !SERVER_SUPPORTED_FILTER_OPERATORS.has(operator);
}

export function hasClientOnlyColumnFilters(filtrosColunas = {}) {
  return Object.values(filtrosColunas).some(filterNeedsClientSideProcessing);
}

export const matchesFilterOptionContains = (option, query) => {
  const normalizedQuery = String(query || "").trim().toLowerCase();
  if (!normalizedQuery) return true;
  return String(option ?? "").toLowerCase().includes(normalizedQuery);
};
