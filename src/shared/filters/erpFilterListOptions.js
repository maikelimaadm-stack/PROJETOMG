import { evaluateErpFilter, matchesFilterOptionContains } from "@/shared/filters/erpFilterEvaluate";
import {
  ERP_OPERATORS_WITHOUT_VALUE,
  ERP_OPERATORS_WITH_RANGE,
} from "@/shared/filters/erpFilterOperators";

/** Interpreta pesquisa "de|até" para operadores Entre / Não está entre. */
export function parseErpFilterSearchRange(searchQuery = "") {
  const raw = String(searchQuery || "").trim();
  if (!raw) return { value: "", valueTo: "" };
  const parts = raw.split(/\s*(?:\||;| até )\s*/i).map((part) => part.trim()).filter(Boolean);
  if (parts.length >= 2) {
    return { value: parts[0], valueTo: parts[1] };
  }
  return { value: raw, valueTo: "" };
}

/**
 * Filtra opções da listagem usando operador + campo Pesquisar.
 * O texto de pesquisa substitui o antigo campo "Digite um valor".
 */
export function filterErpFilterListOptions(
  listOptions = [],
  { filterType = "text", operator = "", searchQuery = "" } = {}
) {
  let options = Array.isArray(listOptions) ? listOptions : [];
  const query = String(searchQuery || "").trim();
  const normalizedOperator = String(operator || "").trim();

  if (!normalizedOperator) {
    if (!query) return options;
    return options.filter((option) => matchesFilterOptionContains(option, query));
  }

  if (ERP_OPERATORS_WITHOUT_VALUE.has(normalizedOperator)) {
    return options.filter((option) =>
      evaluateErpFilter({
        filter: { type: filterType, operator: normalizedOperator, value: "", valueTo: "", values: [] },
        filterType,
        rawValue: option,
        displayValue: option,
      })
    );
  }

  if (!query) return options;

  const { value, valueTo } = ERP_OPERATORS_WITH_RANGE.has(normalizedOperator)
    ? parseErpFilterSearchRange(query)
    : { value: query, valueTo: "" };

  return options.filter((option) =>
    evaluateErpFilter({
      filter: { type: filterType, operator: normalizedOperator, value, valueTo, values: [] },
      filterType,
      rawValue: option,
      displayValue: option,
    })
  );
}
