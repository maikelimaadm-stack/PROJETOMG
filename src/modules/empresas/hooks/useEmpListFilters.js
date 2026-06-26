import { useCallback } from "react";
import { buildMakPanelFilters } from "@/framework/mak/filters";
import {
  syncPanelFiltersIntoColumns,
  syncColumnsIntoPanelFilters,
} from "@/framework/mak/listing/syncPanelColumnFilters";
import { stableJsonEqual } from "@/shared/utils/stableStringify";

const MAK_MODULE_ID = "empresas";

/**
 * Orquestra sincronização painel ↔ colunas e handlers de filtro da listagem Empresas.
 */
export function useEmpListFilters({
  panelFilterColumnMap,
  columnFiltersRef,
  appliedFilterValuesRef,
  closeFilterPanel,
  filterValues,
  setFilterValues,
  setAppliedFilterValues,
  setAppliedPanelFilters,
  setColumnFiltersHydrated,
  setColumnFilters,
  setSearchDraft,
  setSearchTerm,
  setPinnedRecord,
  setSearchFavoritesOnly,
  setDropdownSearch,
  setQueryPage,
}) {
  const handleFilterChange = useCallback((key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, [setFilterValues]);

  const handleFilterClear = useCallback(() => {
    setFilterValues({});
    setAppliedFilterValues({});
    setAppliedPanelFilters(undefined);
    setColumnFiltersHydrated(true);
    setColumnFilters({});
    setSearchDraft("");
    setSearchTerm("");
    setPinnedRecord(null);
    setSearchFavoritesOnly(false);
    setDropdownSearch("");
    setQueryPage(1);
  }, [
    setAppliedFilterValues,
    setAppliedPanelFilters,
    setColumnFilters,
    setColumnFiltersHydrated,
    setDropdownSearch,
    setFilterValues,
    setPinnedRecord,
    setQueryPage,
    setSearchDraft,
    setSearchFavoritesOnly,
    setSearchTerm,
  ]);

  const handleFilterApply = useCallback(
    (snapshot) => {
      const nextValues = snapshot ?? filterValues;
      if (snapshot) {
        setFilterValues(snapshot);
      }
      setAppliedFilterValues({ ...nextValues });
      setAppliedPanelFilters(buildMakPanelFilters(MAK_MODULE_ID, nextValues));
      setColumnFiltersHydrated(true);
      setColumnFilters((prev) =>
        syncPanelFiltersIntoColumns(nextValues, prev, panelFilterColumnMap)
      );
      setQueryPage(1);
      closeFilterPanel();
    },
    [
      closeFilterPanel,
      filterValues,
      panelFilterColumnMap,
      setAppliedFilterValues,
      setAppliedPanelFilters,
      setColumnFilters,
      setColumnFiltersHydrated,
      setFilterValues,
      setQueryPage,
    ]
  );

  const handleColumnFiltersChange = useCallback(
    (nextColumnFilters) => {
      const safeNext = nextColumnFilters || {};
      const syncedPanelValues = syncColumnsIntoPanelFilters(safeNext, panelFilterColumnMap);
      const sameColumnFilters = stableJsonEqual(columnFiltersRef.current || {}, safeNext || {});
      const samePanelFilters = stableJsonEqual(
        appliedFilterValuesRef.current || {},
        syncedPanelValues || {}
      );
      if (sameColumnFilters && samePanelFilters) return;
      columnFiltersRef.current = safeNext;
      appliedFilterValuesRef.current = syncedPanelValues;
      setColumnFiltersHydrated(true);
      setColumnFilters(safeNext);
      setFilterValues(syncedPanelValues);
      setAppliedFilterValues(syncedPanelValues);
      setAppliedPanelFilters(buildMakPanelFilters(MAK_MODULE_ID, syncedPanelValues));
      setQueryPage(1);
    },
    [
      appliedFilterValuesRef,
      columnFiltersRef,
      panelFilterColumnMap,
      setAppliedFilterValues,
      setAppliedPanelFilters,
      setColumnFilters,
      setColumnFiltersHydrated,
      setFilterValues,
      setQueryPage,
    ]
  );

  return {
    handleFilterChange,
    handleFilterClear,
    handleFilterApply,
    handleColumnFiltersChange,
  };
}
