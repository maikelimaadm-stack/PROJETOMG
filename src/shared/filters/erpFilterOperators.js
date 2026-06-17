export const ERP_TEXT_OPERATORS = [
  { value: "contains", label: "Contém" },
  { value: "not_contains", label: "Não contém" },
  { value: "equals", label: "Igual a" },
  { value: "not_equals", label: "Diferente de" },
  { value: "starts_with", label: "Começa com" },
  { value: "ends_with", label: "Termina com" },
  { value: "is_empty", label: "Está vazio" },
  { value: "is_not_empty", label: "Não está vazio" },
];

export const ERP_NUMBER_OPERATORS = [
  { value: "equals", label: "Igual a" },
  { value: "not_equals", label: "Diferente de" },
  { value: "gt", label: "Maior que" },
  { value: "gte", label: "Maior ou igual a" },
  { value: "lt", label: "Menor que" },
  { value: "lte", label: "Menor ou igual a" },
  { value: "between", label: "Entre" },
  { value: "not_between", label: "Não está entre" },
  { value: "is_empty", label: "Está vazio" },
  { value: "is_not_empty", label: "Não está vazio" },
];

export const ERP_MONEY_OPERATORS = [...ERP_NUMBER_OPERATORS];

export const ERP_DATE_OPERATORS = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "this_week", label: "Esta semana" },
  { value: "last_week", label: "Semana passada" },
  { value: "this_month", label: "Este mês" },
  { value: "last_month", label: "Mês passado" },
  { value: "this_year", label: "Este ano" },
  { value: "last_year", label: "Ano passado" },
  { value: "equals", label: "Igual a" },
  { value: "before", label: "Antes de" },
  { value: "after", label: "Depois de" },
  { value: "between", label: "Entre datas" },
  { value: "is_empty", label: "Está vazio" },
  { value: "is_not_empty", label: "Não está vazio" },
];

export const ERP_OPERATORS_BY_TYPE = {
  text: ERP_TEXT_OPERATORS,
  number: ERP_NUMBER_OPERATORS,
  money: ERP_TEXT_OPERATORS,
  date: ERP_DATE_OPERATORS,
  enum: ERP_TEXT_OPERATORS,
};

/** Operadores usados no popup de listagem (operador + pesquisa). */
export function getErpListFilterOperators(filterType) {
  return ERP_OPERATORS_BY_TYPE[filterType] || ERP_TEXT_OPERATORS;
}

export const ERP_DEFAULT_OPERATOR_BY_TYPE = {
  text: "",
  number: "",
  money: "",
  date: "",
  boolean: "",
  enum: "",
};

export const ERP_OPERATORS_WITHOUT_VALUE = new Set([
  "today",
  "yesterday",
  "this_week",
  "last_week",
  "this_month",
  "last_month",
  "this_year",
  "last_year",
  "is_empty",
  "is_not_empty",
]);

export const ERP_OPERATORS_WITH_RANGE = new Set(["between", "not_between"]);

export const ERP_OPERATORS_WITH_SINGLE_VALUE = new Set([
  "contains",
  "not_contains",
  "equals",
  "not_equals",
  "starts_with",
  "ends_with",
  "gt",
  "gte",
  "lt",
  "lte",
  "before",
  "after",
]);

const ALL_OPERATORS = [
  ...ERP_TEXT_OPERATORS,
  ...ERP_NUMBER_OPERATORS,
  ...ERP_DATE_OPERATORS,
  { value: "Sim", label: "Sim" },
  { value: "Não", label: "Não" },
];

/** @deprecated use getErpListFilterOperators */
export function getErpFilterOperators(filterType) {
  return getErpListFilterOperators(filterType);
}

export function getErpDefaultOperator(filterType) {
  return ERP_DEFAULT_OPERATOR_BY_TYPE[filterType] ?? "";
}

export function getErpFilterOperatorLabel(value, filterType = "text") {
  if (!value) return "Selecionar Operador";
  const normalized = normalizeErpFilterOperator(value, filterType) || value;
  const operators = getErpListFilterOperators(filterType);
  const match = operators.find(
    (item) => item.value === normalized || item.label === normalized || item.label === value
  );
  if (match) return match.label;
  const fallback = ALL_OPERATORS.find(
    (item) => item.value === normalized || item.label === value
  );
  return fallback?.label || "Selecionar Operador";
}

/** Converte rótulo legado ou valor interno para a chave padrão do operador. */
export function normalizeErpFilterOperator(value, filterType = "text") {
  const raw = String(value ?? "").trim();
  if (!raw) return "";
  const operators = getErpListFilterOperators(filterType);
  const match = operators.find((item) => item.value === raw || item.label === raw);
  if (match) return match.value;
  const fallback = ALL_OPERATORS.find((item) => item.value === raw || item.label === raw);
  return fallback?.value || "";
}
