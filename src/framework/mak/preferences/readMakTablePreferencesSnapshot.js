import { loadColumnOrder, loadVisibleColumns } from "@/framework/cadastro/tables/empColumnLayout";
import { readPreferencesJson, readPreferencesText } from "@/framework/mak/preferences/userPreferencesCache.js";

export const normalizeMakFrozenColumnCount = (count, visibleCount = 0) => {
  const safeVisible = Math.max(0, Number(visibleCount) || 0);
  const parsed = Math.floor(Number(count) || 0);
  return Math.max(0, Math.min(parsed, safeVisible));
};

/**
 * Snapshot genérico de preferências de tabela MAK.
 */
export function readMakTablePreferencesSnapshot(colunasDisponiveis = [], keys = {}) {
  const {
    WIDTHS_KEY = "mod_col_widths",
    FROZEN_KEY = "mod_col_frozen",
    VISIBLE_KEY = "mod_col_visiveis",
    ORDER_KEY = "mod_col_ordem",
    SORT_KEY = "mod_sort_columns_v1",
    SIZING_MODE_KEY = "mod_col_sizing_mode_v1",
    AGGR_KEY = "mod_table_aggregation_config",
    TEMP_FILTERS_KEY = "mod_temp_listagem_filters",
  } = keys;

  const defaults = Object.fromEntries(
    colunasDisponiveis.map((column) => [column.id, column.width || 160])
  );
  const savedWidths = readPreferencesJson(WIDTHS_KEY, null);
  const savedOrdem = loadColumnOrder(ORDER_KEY, colunasDisponiveis);
  const savedVisiveisRaw = readPreferencesJson(VISIBLE_KEY, null);
  const savedVisiveis = Array.isArray(savedVisiveisRaw)
    ? savedVisiveisRaw
    : loadVisibleColumns(VISIBLE_KEY, colunasDisponiveis);

  const ids = new Set(colunasDisponiveis.map((c) => c.id));
  const visiveis = (savedVisiveis || colunasDisponiveis.filter((c) => c.default !== false).map((c) => c.id)).filter(
    (id) => ids.has(id)
  );
  const ordemBase = (savedOrdem || colunasDisponiveis.map((c) => c.id)).filter((id) => ids.has(id));
  const ordem = [...ordemBase, ...visiveis.filter((id) => !ordemBase.includes(id))];

  const savedSort = readPreferencesJson(SORT_KEY, null);
  let sortConfig = [{ key: colunasDisponiveis[0]?.id ?? "id", direction: "asc" }];
  if (Array.isArray(savedSort) && savedSort.length > 0 && savedSort[0]?.key) {
    sortConfig = [{ key: savedSort[0].key, direction: savedSort[0].direction === "desc" ? "desc" : "asc" }];
  }

  const frozenRaw = Number(readPreferencesText(FROZEN_KEY, "0"));
  const sizingModeRaw = readPreferencesJson(SIZING_MODE_KEY, {});
  const filtrosColunas = readPreferencesJson(TEMP_FILTERS_KEY, {});

  return {
    colunasOrdem: ordem,
    colunasVisiveis: visiveis,
    columnWidths: savedWidths && typeof savedWidths === "object" ? { ...defaults, ...savedWidths } : defaults,
    frozenColumnCount: normalizeMakFrozenColumnCount(frozenRaw, visiveis.length),
    sortConfig,
    filtrosColunas: filtrosColunas && typeof filtrosColunas === "object" ? filtrosColunas : {},
    layoutAggregationConfig: readPreferencesJson(AGGR_KEY, {}) || {},
    columnSizingMode:
      sizingModeRaw && typeof sizingModeRaw === "object" && !Array.isArray(sizingModeRaw) ? sizingModeRaw : {},
    autoFitActiveColumns: {},
  };
}
