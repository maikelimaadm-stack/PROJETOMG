import {
  loadColumnOrder,
  loadVisibleColumns,
  markVisibleColumnsInitialized,
} from "@/framework/cadastro/tables/empColumnLayout";
import {
  loadSavedVisibleColumns,
  mergeEffectiveColumnLayout,
} from "@/modules/empresas/utils/empTableColumnCatalog";
import {
  AGGR_KEY,
  COLUNAS_BASE,
  FILTERS_KEY,
  FROZEN_KEY,
  ORDER_KEY,
  SIZING_MODE_KEY,
  SORT_KEY,
  VISIBLE_KEY,
  WIDTHS_KEY,
} from "@/modules/empresas/components/tblEmp.constants";
import {
  readEmpPreferencesJson,
  readEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";

const readSortConfig = () => {
  const saved = readEmpPreferencesJson(SORT_KEY, null);
  if (Array.isArray(saved) && saved.length > 0) {
    const first = saved.find((item) => item?.key);
    if (first?.key) {
      return [{ key: first.key, direction: first.direction === "desc" ? "desc" : "asc" }];
    }
  }
  if (saved?.key) {
    return [{ key: saved.key, direction: saved.direction === "desc" ? "desc" : "asc" }];
  }
  return [{ key: "codempresa", direction: "asc" }];
};

export const readEmpTablePreferencesSnapshot = (colunasDisponiveis = COLUNAS_BASE) => {
  const defaults = Object.fromEntries(
    colunasDisponiveis.map((column) => [column.id, column.width || 160])
  );
  const savedWidths = readEmpPreferencesJson(WIDTHS_KEY, null);
  const savedOrdem = loadColumnOrder(ORDER_KEY, colunasDisponiveis);
  const savedVisiveis = loadSavedVisibleColumns(VISIBLE_KEY);
  const { ordem, visiveis } = mergeEffectiveColumnLayout(
    colunasDisponiveis,
    savedOrdem,
    savedVisiveis
  );
  const sizingModeRaw = readEmpPreferencesJson(SIZING_MODE_KEY, {});
  const columnSizingMode =
    sizingModeRaw && typeof sizingModeRaw === "object" && !Array.isArray(sizingModeRaw)
      ? sizingModeRaw
      : {};

  return {
    colunasOrdem: ordem,
    colunasVisiveis: visiveis,
    columnWidths: savedWidths && typeof savedWidths === "object" ? { ...defaults, ...savedWidths } : defaults,
    frozenColumnCount: Math.max(0, Number(readEmpPreferencesText(FROZEN_KEY, "0")) || 0),
    sortConfig: readSortConfig(),
    filtrosColunas: readEmpPreferencesJson(FILTERS_KEY, {}) || {},
    layoutAggregationConfig: readEmpPreferencesJson(AGGR_KEY, {}) || {},
    autoFitActiveColumns: Object.fromEntries(
      Object.entries(columnSizingMode)
        .filter(([, mode]) => mode === "auto")
        .map(([columnId]) => [columnId, true])
    ),
    columnSizingMode,
  };
};

export const markEmpTableVisibleColumnsPersisted = () => {
  markVisibleColumnsInitialized();
};

export const buildColumnSizingModeFromAutoFit = (autoFitActiveColumns = {}) =>
  Object.fromEntries(
    Object.entries(autoFitActiveColumns)
      .filter(([, active]) => Boolean(active))
      .map(([columnId]) => [columnId, "auto"])
  );

export const mergeColumnSizingMode = (previous = {}, columnId, mode) => {
  const next = { ...(previous || {}) };
  if (mode === "auto") next[columnId] = "auto";
  else delete next[columnId];
  return next;
};
