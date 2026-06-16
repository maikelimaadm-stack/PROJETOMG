export const getColumnFilterType = (col) => {
  if (col?.id === "codempresa") return "number";
  if (col?.tipo === "date" || col?.id === "data") return "date";
  if (col?.tipo === "number" && col?.usar_mascara) return "list";
  if (["number", "calculado"].includes(col?.tipo) || col?.id === "codempresa") return "number";
  return "list";
};

export const TEXT_FILTER_OPERATORS = [
  { value: "contains", label: "Contém" },
  { value: "not_contains", label: "Não contém" },
  { value: "starts_with", label: "Começa com" },
  { value: "ends_with", label: "Termina com" },
  { value: "equals", label: "Igual" },
  { value: "not_equals", label: "Diferente" },
];

export const NUMBER_FILTER_OPERATORS = [
  { value: "equals", label: "Igual" },
  { value: "not_equals", label: "Diferente" },
  { value: "gt", label: "Maior que" },
  { value: "lt", label: "Menor que" },
  { value: "between", label: "Entre" },
];

export const DATE_FILTER_OPERATORS = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "last_7_days", label: "Últimos 7 dias" },
  { value: "last_30_days", label: "Últimos 30 dias" },
  { value: "range", label: "Intervalo personalizado" },
  { value: "equals", label: "Igual" },
  { value: "not_equals", label: "Diferente" },
];

export const getFilterOperators = (filterType) => {
  if (filterType === "number") return NUMBER_FILTER_OPERATORS;
  if (filterType === "date") return DATE_FILTER_OPERATORS;
  return TEXT_FILTER_OPERATORS;
};

export const getDefaultFilterOperator = (filterType) => {
  if (filterType === "number") return "equals";
  if (filterType === "date") return "today";
  return "contains";
};

export const createDefaultColumnFilter = (filterType) => ({
  type: filterType,
  operator: getDefaultFilterOperator(filterType),
  value: "",
  valueTo: "",
  values: [],
});

export const getRangeFilterValues = (valores, ft) => {
  if (ft === "number") return valores.filter((i) => String(i).startsWith("min:") || String(i).startsWith("max:"));
  if (ft === "date") return valores.filter((i) => String(i).startsWith("start:") || String(i).startsWith("end:"));
  return [];
};

export const getListFilterValues = (valores, ft) => {
  if (ft === "number") return valores.filter((i) => !String(i).startsWith("min:") && !String(i).startsWith("max:"));
  if (ft === "date") return valores.filter((i) => !String(i).startsWith("start:") && !String(i).startsWith("end:"));
  return valores;
};

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
  return Number(s.replace(/\./g, "").replace(",", "."));
};

export const formatRangeTokenForInput = (token, ft, col) => {
  if (!token) return "";
  const raw = String(token).replace(/^(min:|max:|start:|end:)/, "");
  if (!raw) return "";
  if (ft === "date") {
    if (/^\d{4}-\d{2}-\d{2}/.test(raw)) {
      const [ano, mes, dia] = raw.split("T")[0].split("-");
      return `${dia}/${mes}/${ano}`;
    }
    return raw;
  }
  const n = parseNumberFilterValue(raw);
  if (!Number.isFinite(n)) return raw;
  if (col?.id === "codempresa") return String(n);
  const places = col?.decimal_places ?? 2;
  return n.toLocaleString("pt-BR", col?.usar_decimal ? { minimumFractionDigits: places, maximumFractionDigits: places } : { maximumFractionDigits: 0 });
};

export const getRangeTokenInputValue = (token) => {
  if (!token) return "";
  return String(token).replace(/^(min:|max:|start:|end:)/, "");
};

export const normalizeRangeValoresForEdit = (colunaId, valores, colunasDisponiveis) => {
  const col = colunasDisponiveis.find((c) => c.id === colunaId);
  const ft = getColumnFilterType(col);
  if (ft !== "number" && ft !== "date") return valores;
  return valores.map((v) => {
    const s = String(v);
    if (s.startsWith("min:") || s.startsWith("max:") || s.startsWith("start:") || s.startsWith("end:")) {
      const prefix = s.match(/^(min:|max:|start:|end:)/)?.[0] || "";
      const formatted = formatRangeTokenForInput(s, ft, col);
      return formatted ? `${prefix}${formatted}` : v;
    }
    return v;
  });
};

const getStartOfDay = (dateLike) => {
  const base = dateLike ? new Date(dateLike) : new Date();
  return new Date(base.getFullYear(), base.getMonth(), base.getDate());
};

const getEndOfDay = (dateLike) => {
  const base = dateLike ? new Date(dateLike) : new Date();
  return new Date(base.getFullYear(), base.getMonth(), base.getDate(), 23, 59, 59, 999);
};

const evaluateTextOperator = (operator, sourceValue, targetValue) => {
  const src = String(sourceValue || "").toLowerCase();
  const target = String(targetValue || "").toLowerCase();
  if (!target && operator !== "equals" && operator !== "not_equals") return true;
  switch (operator) {
    case "contains":
      return src.includes(target);
    case "not_contains":
      return !src.includes(target);
    case "starts_with":
      return src.startsWith(target);
    case "ends_with":
      return src.endsWith(target);
    case "equals":
      return src === target;
    case "not_equals":
      return src !== target;
    default:
      return true;
  }
};

const evaluateNumberOperator = (operator, sourceValue, targetValue, targetValueTo) => {
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
    case "lt":
      return Number.isFinite(target) ? source < target : true;
    case "between":
      if (!Number.isFinite(target) && !Number.isFinite(targetTo)) return true;
      if (Number.isFinite(target) && source < target) return false;
      if (Number.isFinite(targetTo) && source > targetTo) return false;
      return true;
    default:
      return true;
  }
};

const evaluateDateOperator = (operator, sourceValue, targetValue, targetValueTo) => {
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
      const start = getStartOfDay(yesterday).getTime();
      const end = getEndOfDay(yesterday).getTime();
      return sourceTs >= start && sourceTs <= end;
    }
    case "last_7_days": {
      const start = getStartOfDay(now);
      start.setDate(start.getDate() - 6);
      return sourceTs >= start.getTime() && sourceTs <= todayEnd;
    }
    case "last_30_days": {
      const start = getStartOfDay(now);
      start.setDate(start.getDate() - 29);
      return sourceTs >= start.getTime() && sourceTs <= todayEnd;
    }
    case "equals": {
      const targetTs = parseDateFilterValue(targetValue);
      if (targetTs === null) return true;
      const start = getStartOfDay(targetTs).getTime();
      const end = getEndOfDay(targetTs).getTime();
      return sourceTs >= start && sourceTs <= end;
    }
    case "not_equals": {
      const targetTs = parseDateFilterValue(targetValue);
      if (targetTs === null) return true;
      const start = getStartOfDay(targetTs).getTime();
      const end = getEndOfDay(targetTs).getTime();
      return sourceTs < start || sourceTs > end;
    }
    case "range": {
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

export const normalizeLegacyColumnFilter = (legacyValues = [], filterType = "list") => {
  if (!Array.isArray(legacyValues)) return createDefaultColumnFilter(filterType);
  if (filterType === "number") {
    const minToken = legacyValues.find((item) => String(item).startsWith("min:"));
    const maxToken = legacyValues.find((item) => String(item).startsWith("max:"));
    const listValues = getListFilterValues(legacyValues, filterType);
    if (minToken || maxToken) {
      return {
        type: filterType,
        operator: "between",
        value: minToken ? String(minToken).replace("min:", "") : "",
        valueTo: maxToken ? String(maxToken).replace("max:", "") : "",
        values: listValues,
      };
    }
    return {
      type: filterType,
      operator: "equals",
      value: listValues[0] ?? "",
      valueTo: "",
      values: listValues,
    };
  }
  if (filterType === "date") {
    const startToken = legacyValues.find((item) => String(item).startsWith("start:"));
    const endToken = legacyValues.find((item) => String(item).startsWith("end:"));
    const listValues = getListFilterValues(legacyValues, filterType);
    if (startToken || endToken) {
      return {
        type: filterType,
        operator: "range",
        value: startToken ? String(startToken).replace("start:", "") : "",
        valueTo: endToken ? String(endToken).replace("end:", "") : "",
        values: listValues,
      };
    }
    return {
      type: filterType,
      operator: "equals",
      value: listValues[0] ?? "",
      valueTo: "",
      values: listValues,
    };
  }
  return {
    type: filterType,
    operator: "equals",
    value: legacyValues[0] ?? "",
    valueTo: "",
    values: legacyValues,
  };
};

export const evaluateColumnFilter = ({ filterDraft, filterType, rawValue, displayValue }) => {
  if (!filterDraft || typeof filterDraft !== "object") return true;
  const operator = filterDraft.operator || getDefaultFilterOperator(filterType);
  const value = filterDraft.value ?? "";
  const valueTo = filterDraft.valueTo ?? "";
  const listValues = Array.isArray(filterDraft.values) ? filterDraft.values : [];
  if (listValues.length > 0) {
    const sourceValue = displayValue ?? rawValue ?? "";
    if (!listValues.includes(sourceValue)) return false;
  }
  if (filterType === "number") return evaluateNumberOperator(operator, rawValue, value, valueTo);
  if (filterType === "date") return evaluateDateOperator(operator, rawValue, value, valueTo);
  return evaluateTextOperator(operator, displayValue ?? rawValue ?? "", value);
};

export const optionPassaRangeTemp = (opt, ft, tempValores) => {
  if (!tempValores?.length) return true;
  const minTok = tempValores.find((i) => String(i).startsWith(ft === "date" ? "start:" : "min:"));
  const maxTok = tempValores.find((i) => String(i).startsWith(ft === "date" ? "end:" : "max:"));
  if (!minTok && !maxTok) return true;
  if (ft === "number") {
    const nv = parseNumberFilterValue(String(opt));
    const minN = minTok ? parseNumberFilterValue(String(minTok).replace("min:", "")) : NaN;
    const maxN = maxTok ? parseNumberFilterValue(String(maxTok).replace("max:", "")) : NaN;
    if (Number.isFinite(minN) && nv < minN) return false;
    if (Number.isFinite(maxN) && nv > maxN) return false;
    return true;
  }
  const ts = parseDateFilterValue(opt);
  const startTs = minTok ? parseDateFilterValue(String(minTok).replace("start:", "")) : null;
  const endTs = maxTok ? parseDateFilterValue(String(maxTok).replace("end:", "")) : null;
  if (startTs != null && ts != null && ts < startTs) return false;
  if (endTs != null && ts != null && ts > endTs) return false;
  return true;
};
