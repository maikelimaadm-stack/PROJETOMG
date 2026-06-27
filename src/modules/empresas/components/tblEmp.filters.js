/** @deprecated Import from `@/shared/filters/columnRangeFilters` — mantido para compatibilidade com TBLEMP. */
export {
  getColumnFilterType,
  TEXT_FILTER_OPERATORS,
  NUMBER_FILTER_OPERATORS,
  DATE_FILTER_OPERATORS,
  getFilterOperators,
  getDefaultFilterOperator,
  createDefaultColumnFilter,
  evaluateColumnFilter,
  normalizeLegacyColumnFilter,
  filterNeedsClientSideProcessing,
  hasClientOnlyColumnFilters,
  matchesFilterOptionContains,
  parseDateFilterValue,
  parseNumberFilterValue,
} from "@/shared/filters";

export {
  getRangeFilterValues,
  getListFilterValues,
  formatRangeTokenForInput,
  getRangeTokenInputValue,
  normalizeRangeValoresForEdit,
  optionPassaRangeTemp,
} from "@/shared/filters/columnRangeFilters.js";
