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
  { value: "gte", label: "Maior ou igual" },
  { value: "lt", label: "Menor que" },
  { value: "lte", label: "Menor ou igual" },
  { value: "between", label: "Entre" },
  { value: "not_between", label: "Não está entre" },
  { value: "is_empty", label: "Está vazio" },
  { value: "is_not_empty", label: "Não está vazio" },
];

export const ERP_MONEY_OPERATORS = [...ERP_NUMBER_OPERATORS];

export const ERP_DATE_OPERATORS = [
  { value: "today", label: "Hoje" },
  { value: "yesterday", label: "Ontem" },
  { value: "this_week", label: "Esta Semana" },
  { value: "last_week", label: "Semana Passada" },
  { value: "this_month", label: "Este Mês" },
  { value: "last_month", label: "Mês Passado" },
  { value: "this_year", label: "Este Ano" },
  { value: "last_year", label: "Ano Passado" },
  { value: "equals", label: "Igual a" },
  { value: "before", label: "Antes de" },
  { value: "after", label: "Depois de" },
  { value: "between", label: "Entre Datas" },
  { value: "is_empty", label: "Está vazio" },
  { value: "is_not_empty", label: "Não está vazio" },
];

export const ERP_OPERATORS_BY_TYPE = {
  text: ERP_TEXT_OPERATORS,
  number: ERP_NUMBER_OPERATORS,
  money: ERP_MONEY_OPERATORS,
  date: ERP_DATE_OPERATORS,
};

export const ERP_DEFAULT_OPERATOR_BY_TYPE = {
  text: "contains",
  number: "equals",
  money: "equals",
  date: "today",
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

export function getErpFilterOperators(filterType) {
  return ERP_OPERATORS_BY_TYPE[filterType] || ERP_TEXT_OPERATORS;
}

export function getErpDefaultOperator(filterType) {
  return ERP_DEFAULT_OPERATOR_BY_TYPE[filterType] || "contains";
}
