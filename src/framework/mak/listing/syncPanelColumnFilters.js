import {
  cloneErpFilter,
  isErpFilterActive,
  normalizePanelFilterValue,
} from "@/shared/filters";

/** Sincroniza filtros do painel lateral para filtros de coluna da tabela. */
export function syncPanelFiltersIntoColumns(
  panelValues = {},
  baseColumnFilters = {},
  panelFilterColumnMap = {}
) {
  const next = { ...(baseColumnFilters || {}) };
  Object.values(panelFilterColumnMap).forEach((columnKey) => {
    delete next[columnKey];
  });

  Object.entries(panelFilterColumnMap).forEach(([panelKey, columnKey]) => {
    const filter = panelValues?.[panelKey];
    if (isErpFilterActive(filter)) {
      next[columnKey] = cloneErpFilter(
        typeof filter === "object" && !Array.isArray(filter)
          ? filter
          : normalizePanelFilterValue(filter, "text")
      );
    }
  });

  return next;
}

/** Sincroniza filtros de coluna da tabela para valores do painel lateral. */
export function syncColumnsIntoPanelFilters(columnFilters = {}, panelFilterColumnMap = {}) {
  return Object.entries(panelFilterColumnMap).reduce((acc, [panelKey, columnKey]) => {
    const filter = columnFilters?.[columnKey];
    acc[panelKey] =
      filter && typeof filter === "object" && !Array.isArray(filter)
        ? cloneErpFilter(filter)
        : normalizePanelFilterValue(filter, "text");
    return acc;
  }, {});
}
