import { useCallback } from "react";
import { buildMakPanelFilters } from "@/framework/mak/filters";
import {
  syncPanelFiltersIntoColumns,
  syncColumnsIntoPanelFilters,
} from "@/framework/mak/listing/syncPanelColumnFilters";
import { stableJsonEqual } from "@/shared/utils/stableStringify";

/**
 * Sincronização painel ↔ colunas e handlers de filtro — infraestrutura MAK reutilizável.
 */
export function useMakListFilters({
  moduleId,
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
  const handleFilterChange = useCallback(
    (key, value) => {
      setFilterValues((prev) => ({ ...prev, [key]: value }));
    },
    [setFilterValues]
  );

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
      setAppliedPanelFilters(buildMakPanelFilters(moduleId, nextValues));
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
      moduleId,
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
      setAppliedPanelFilters(buildMakPanelFilters(moduleId, syncedPanelValues));
      setQueryPage(1);
    },
    [
      appliedFilterValuesRef,
      columnFiltersRef,
      moduleId,
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
