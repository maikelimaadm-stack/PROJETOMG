import { syncPanelFiltersIntoColumns, syncColumnsIntoPanelFilters } from "./syncPanelColumnFilters.js";

export { syncPanelFiltersIntoColumns, syncColumnsIntoPanelFilters };
export { useMakListFilters } from "./useMakListFilters.js";
export { useMakSearchHandlers } from "./useMakSearchHandlers.js";
export { useMakInfiniteListData } from "./useMakInfiniteListData.js";

/** @param {object} panelValues @param {object} panelFilterColumnMap */
export function createPanelColumnFilterSync(panelFilterColumnMap) {
  return {
    panelToColumns: (panelValues, baseColumnFilters) =>
      syncPanelFiltersIntoColumns(panelValues, baseColumnFilters, panelFilterColumnMap),
    columnsToPanel: (columnFilters) =>
      syncColumnsIntoPanelFilters(columnFilters, panelFilterColumnMap),
  };
}
