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
import {
  EMP_CARDS_LAYOUT_DEFAULT,
  EMP_SEARCH_DEFAULT_FIELDS,
  loadCardsLayoutConfig,
  loadSearchVisFields,
  mergeSearchVisFields,
} from "@/modules/empresas/components/empSearchView.constants";
import { loadFilterFieldsLayout } from "@/modules/empresas/utils/empFilterFieldsLayout";
import { readStoredTempListagemFilters } from "@/modules/empresas/preferences/empresasPreferencesStorage";
import { stableJsonEqual } from "@/shared/utils/stableStringify";

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
    filtrosColunas: readStoredTempListagemFilters(),
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

/** Adiciona colunas novas do catálogo sem resetar ordem/visibilidade já pintadas. */
export const mergeExpandedCatalogIntoTableState = (
  current = {},
  expandedColumns = [],
  previousCatalogSignature = ""
) => {
  const prevIds = new Set(String(previousCatalogSignature || "").split("|").filter(Boolean));
  const newColumnIds = expandedColumns.map((column) => column.id).filter((id) => !prevIds.has(id));
  if (newColumnIds.length === 0) return null;

  const columnsById = new Map(expandedColumns.map((column) => [column.id, column]));
  const nextOrdem = [...(current.colunasOrdem || [])];
  newColumnIds.forEach((id) => {
    if (!nextOrdem.includes(id)) nextOrdem.push(id);
  });

  const nextVisiveis = [...(current.colunasVisiveis || [])];
  newColumnIds.forEach((id) => {
    const column = columnsById.get(id);
    if (column?.default && !nextVisiveis.includes(id)) nextVisiveis.push(id);
  });

  const defaults = Object.fromEntries(
    expandedColumns.map((column) => [column.id, column.width || 160])
  );
  const nextWidths = { ...defaults, ...(current.columnWidths || {}) };
  newColumnIds.forEach((id) => {
    const column = columnsById.get(id);
    if (column && nextWidths[id] == null) nextWidths[id] = column.width || 160;
  });

  return {
    colunasOrdem: nextOrdem,
    colunasVisiveis: nextVisiveis,
    columnWidths: nextWidths,
  };
};

export const readEmpCardsPreferencesSnapshot = (catalog = EMP_SEARCH_DEFAULT_FIELDS) => {
  const sourceCatalog = Array.isArray(catalog) && catalog.length > 0 ? catalog : EMP_SEARCH_DEFAULT_FIELDS;
  return {
    visFields: loadSearchVisFields(sourceCatalog),
    layoutConfig: loadCardsLayoutConfig() || { ...EMP_CARDS_LAYOUT_DEFAULT },
  };
};

export const readEmpFiltersPreferencesSnapshot = (catalogKeys = []) => ({
  layout: loadFilterFieldsLayout(catalogKeys),
});

/** Mescla campos novos do catálogo nos cards sem resetar visibilidade salva. */
export const mergeExpandedCatalogIntoCardsState = (
  currentVisFields = [],
  expandedCatalog = [],
  previousCatalogSignature = ""
) => {
  const prevKeys = new Set(String(previousCatalogSignature || "").split("|").filter(Boolean));
  const newKeys = expandedCatalog.map((field) => field.key).filter((key) => key && !prevKeys.has(key));
  if (newKeys.length === 0) return null;
  const merged = mergeSearchVisFields(expandedCatalog, currentVisFields);
  return stableJsonEqual(currentVisFields, merged) ? null : merged;
};
