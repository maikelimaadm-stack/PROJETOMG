import { useCallback } from "react";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

/**
 * Handlers de busca de listagem MAK (draft, commit, favoritos, pin de registro).
 */
export function useMakSearchHandlers({
  searchDraft,
  searchViewApplyRef,
  showForm,
  viewMode,
  setSearchDraft,
  setSearchTerm,
  setPinnedRecord,
  setSearchFavoritesOnly,
  setDropdownSearch,
  setSearchViewPending,
  setTableFilteredRecords,
  setSelectedTableItems,
  setQueryPage,
  setSelectedIndex,
  setEditingRecord,
}) {
  const handleSearchInputChange = useCallback(
    (value) => {
      setSearchDraft(value);
      if (!String(value || "").trim()) {
        setPinnedRecord(null);
      }
    },
    [setPinnedRecord, setSearchDraft]
  );

  const handleSearchClear = useCallback(() => {
    setSearchDraft("");
    setSearchTerm("");
    setPinnedRecord(null);
    setSearchFavoritesOnly(false);
    setDropdownSearch("");
    setSearchViewPending(false);
    searchViewApplyRef.current = null;
    setTableFilteredRecords(null);
    setSelectedTableItems([]);
  }, [
    searchViewApplyRef,
    setDropdownSearch,
    setPinnedRecord,
    setSearchDraft,
    setSearchFavoritesOnly,
    setSearchTerm,
    setSearchViewPending,
    setSelectedTableItems,
    setTableFilteredRecords,
  ]);

  const handleSearchCommit = useCallback(
    (value) => {
      const next = String(value || "").trim();
      setPinnedRecord(null);
      setSearchTerm(next);
      setQueryPage(1);
      setTableFilteredRecords(null);
      setSelectedTableItems([]);
    },
    [setPinnedRecord, setQueryPage, setSearchTerm, setSelectedTableItems, setTableFilteredRecords]
  );

  const handleSearchApplyAll = useCallback(() => {
    const next = normalizeSearchQuery(searchDraft);
    searchViewApplyRef.current = "all";
    setSearchViewPending(true);
    setSearchFavoritesOnly(false);
    setPinnedRecord(null);
    setSearchTerm(next);
    setQueryPage(1);
    setTableFilteredRecords(null);
    setSelectedTableItems([]);
  }, [
    searchDraft,
    searchViewApplyRef,
    setPinnedRecord,
    setQueryPage,
    setSearchFavoritesOnly,
    setSearchTerm,
    setSearchViewPending,
    setSelectedTableItems,
    setTableFilteredRecords,
  ]);

  const handleSearchApplyFavorites = useCallback(() => {
    searchViewApplyRef.current = "all";
    setSearchViewPending(true);
    setSearchFavoritesOnly(true);
    setPinnedRecord(null);
    setSearchTerm(normalizeSearchQuery(searchDraft));
    setTableFilteredRecords(null);
    setSelectedTableItems([]);
  }, [
    searchDraft,
    searchViewApplyRef,
    setPinnedRecord,
    setSearchFavoritesOnly,
    setSearchTerm,
    setSearchViewPending,
    setSelectedTableItems,
    setTableFilteredRecords,
  ]);

  const handleSearchResultSelect = useCallback(
    (record) => {
      if (!record) return;
      searchViewApplyRef.current = "single";
      setSearchViewPending(true);
      setSearchFavoritesOnly(false);
      setPinnedRecord(record);
      setSearchTerm(normalizeSearchQuery(searchDraft));
      setTableFilteredRecords(null);
      setSelectedTableItems([]);
      setSelectedIndex(0);
      if (showForm && viewMode === "record") {
        setEditingRecord(record);
      }
    },
    [
      searchDraft,
      searchViewApplyRef,
      setEditingRecord,
      setPinnedRecord,
      setSearchFavoritesOnly,
      setSearchTerm,
      setSearchViewPending,
      setSelectedIndex,
      setSelectedTableItems,
      setTableFilteredRecords,
      showForm,
      viewMode,
    ]
  );

  return {
    handleSearchInputChange,
    handleSearchClear,
    handleSearchCommit,
    handleSearchApplyAll,
    handleSearchApplyFavorites,
    handleSearchResultSelect,
  };
}
