import { evaluateErpFilter, matchesFilterOptionContains } from "@/shared/filters/erpFilterEvaluate";
import {
  ERP_DATE_OPERATORS_WITH_SINGLE_DATE,
  ERP_OPERATORS_WITHOUT_VALUE,
  ERP_OPERATORS_WITH_RANGE,
} from "@/shared/filters/erpFilterOperators";

/**
 * Filtra opções da listagem usando operador + pesquisa ou intervalo (dois campos).
 */
export function filterErpFilterListOptions(
  listOptions = [],
  {
    filterType = "text",
    operator = "",
    searchQuery = "",
    rangeValue = "",
    rangeValueTo = "",
  } = {}
) {
  let options = Array.isArray(listOptions) ? listOptions : [];
  const normalizedOperator = String(operator || "").trim();
  const query = String(searchQuery || "").trim();
  const isRange = ERP_OPERATORS_WITH_RANGE.has(normalizedOperator);
  const isDateSingle = filterType === "date" && ERP_DATE_OPERATORS_WITH_SINGLE_DATE.has(normalizedOperator);

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

  if (isRange) {
    const value = String(rangeValue || "").trim();
    const valueTo = String(rangeValueTo || "").trim();
    if (!value && !valueTo) return options;
    return options.filter((option) =>
      evaluateErpFilter({
        filter: { type: filterType, operator: normalizedOperator, value, valueTo, values: [] },
        filterType,
        rawValue: option,
        displayValue: option,
      })
    );
  }

  if (isDateSingle) {
    const value = String(rangeValue || "").trim();
    if (!value) return options;
    return options.filter((option) =>
      evaluateErpFilter({
        filter: { type: filterType, operator: normalizedOperator, value, valueTo: "", values: [] },
        filterType,
        rawValue: option,
        displayValue: option,
      })
    );
  }

  if (!query) return options;

  if (normalizedOperator === "contains") {
    return options.filter((option) => matchesFilterOptionContains(option, query));
  }

  return options.filter((option) =>
    evaluateErpFilter({
      filter: { type: filterType, operator: normalizedOperator, value: query, valueTo: "", values: [] },
      filterType,
      rawValue: option,
      displayValue: option,
    })
  );
}
