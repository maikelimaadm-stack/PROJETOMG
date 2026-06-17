import { evaluateErpFilter, matchesFilterOptionContains } from "@/shared/filters/erpFilterEvaluate";

export function filterErpFilterListOptions(
  listOptions = [],
  { filterType = "text", operator = "", value = "", valueTo = "", searchQuery = "" } = {}
) {
  let options = Array.isArray(listOptions) ? listOptions : [];
  const query = String(searchQuery || "").trim();
  if (query) {
    options = options.filter((option) => matchesFilterOptionContains(option, query));
  }
  if (operator) {
    options = options.filter((option) =>
      evaluateErpFilter({
        filter: { type: filterType, operator, value, valueTo, values: [] },
        filterType,
        rawValue: option,
        displayValue: option,
      })
    );
  }
  return options;
}
