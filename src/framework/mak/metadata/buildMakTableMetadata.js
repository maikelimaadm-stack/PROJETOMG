/**
 * Constrói metadata declarativa de tabela MAK a partir de colunas e prefixo de prefs.
 */
import {
  createDefaultColumnFilter,
  evaluateColumnFilter,
  filterNeedsClientSideProcessing,
  getColumnFilterType,
  hasClientOnlyColumnFilters,
  normalizeLegacyColumnFilter,
  parseDateFilterValue,
} from "@/shared/filters";
import { readMakTablePreferencesSnapshot } from "@/framework/mak/preferences/readMakTablePreferencesSnapshot.js";
import {
  emitPreferencesCacheUpdate,
  readPreferencesJson,
  readPreferencesText,
  writePreferencesJson,
  writePreferencesText,
} from "@/framework/mak/preferences/userPreferencesCache.js";

const TABLE_DEFAULTS = {
  MIN_COL_WIDTH: 80,
  MAX_AUTO_FIT_WIDTH: 520,
  AUTO_FIT_MEASURE_LIMIT: 300,
  ROW_DBLCLICK_OPEN_MS: 260,
  ROW_DBLCLICK_PAIR_MS: 500,
  FILTER_POPOVER_WIDTH: 280,
};

export function buildMakTableMetadata({
  columns,
  keyPrefix,
  defaultSort = null,
  formatHeaderLabel = (col) => String(col?.label || ""),
  getMinWidth = (col) => Math.max(80, String(col?.label || "").length * 7 + 74),
  resolveFieldValue = null,
  resolveComparableValue = null,
}) {
  const preferenceKeys = {
    WIDTHS_KEY: `${keyPrefix}_col_widths`,
    FROZEN_KEY: `${keyPrefix}_col_frozen`,
    VISIBLE_KEY: `${keyPrefix}_col_visiveis`,
    ORDER_KEY: `${keyPrefix}_col_ordem`,
    AGGR_KEY: `${keyPrefix}_table_aggregation_config`,
    PAGE_SIZE_KEY: `${keyPrefix}_table_page_size`,
    SORT_KEY: `${keyPrefix}_sort_columns_v1`,
    SIZING_MODE_KEY: `${keyPrefix}_col_sizing_mode_v1`,
    FILTERS_KEY: `${keyPrefix}_col_filters_v2`,
    TEMP_FILTERS_KEY: `${keyPrefix}_temp_listagem_filters`,
    FILTER_OPERATORS_KEY: `${keyPrefix}_filter_operators_v1`,
  };

  return {
    columns,
    defaultSort: defaultSort ?? { key: columns[0]?.id ?? "id", direction: "asc" },
    constants: {
      ...TABLE_DEFAULTS,
      formatHeaderLabel,
      getMinWidth,
    },
    preferenceKeys,
    filterHelpers: {
      createDefaultColumnFilter,
      evaluateColumnFilter,
      filterNeedsClientSideProcessing,
      getColumnFilterType,
      hasClientOnlyColumnFilters,
      normalizeLegacyColumnFilter,
      parseDateFilterValue,
    },
    hydration: {
      readTablePreferencesSnapshot: (cols) =>
        readMakTablePreferencesSnapshot(cols ?? columns, preferenceKeys),
      buildColumnSizingModeFromAutoFit: (autoFitMap = {}) => autoFitMap,
      mergeColumnSizingMode: (prev = {}, columnId, mode) => ({ ...prev, [columnId]: mode }),
    },
    storage: {
      readStoredFilterOperators: () => readPreferencesJson(preferenceKeys.FILTER_OPERATORS_KEY, {}),
      writeStoredFilterOperators: (ops) =>
        writePreferencesJson(preferenceKeys.FILTER_OPERATORS_KEY, ops, { reason: "listagem:filter-operators" }),
      writeStoredTempListagemFilters: (filters) =>
        writePreferencesJson(preferenceKeys.TEMP_FILTERS_KEY, filters, { reason: "listagem:temp-filters" }),
      readStoredTempListagemFilters: () => readPreferencesJson(preferenceKeys.TEMP_FILTERS_KEY, {}),
    },
    catalog: {
      loadSavedVisibleColumns: (key) => {
        const saved = readPreferencesJson(key ?? preferenceKeys.VISIBLE_KEY, null);
        return Array.isArray(saved) ? saved : null;
      },
      mergeEffectiveColumnLayout: (disponiveis, ordem, visiveis) => {
        const ids = new Set(disponiveis.map((c) => c.id));
        const safeVis = (visiveis || []).filter((id) => ids.has(id));
        const defaultVis = disponiveis.filter((c) => c.default !== false).map((c) => c.id);
        const resolvedVis = safeVis.length ? safeVis : defaultVis;
        const safeOrd = (ordem || []).filter((id) => ids.has(id));
        const tail = resolvedVis.filter((id) => !safeOrd.includes(id));
        return { ordem: [...safeOrd, ...tail], visiveis: resolvedVis };
      },
    },
    useCustomFieldsHook: () => ({ data: [], isFetched: true }),
    emitCacheUpdate: emitPreferencesCacheUpdate,
    resolveFieldValue,
    resolveComparableValue,
  };
}
