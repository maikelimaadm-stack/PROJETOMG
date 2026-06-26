import { useCallback } from "react";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";

/**
 * Handlers de busca da listagem Empresas (draft, commit, favoritos, pin).
 */
export function useEmpSearchHandlers({
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
  setTableFilteredEmpresas,
  setSelectedTableItems,
  setQueryPage,
  setSelectedIndex,
  setEditingEmp,
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
    setTableFilteredEmpresas(null);
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
    setTableFilteredEmpresas,
  ]);

  const handleSearchCommit = useCallback(
    (value) => {
      const next = String(value || "").trim();
      setPinnedRecord(null);
      setSearchTerm(next);
      setQueryPage(1);
      setTableFilteredEmpresas(null);
      setSelectedTableItems([]);
    },
    [setPinnedRecord, setQueryPage, setSearchTerm, setSelectedTableItems, setTableFilteredEmpresas]
  );

  const handleSearchApplyAll = useCallback(() => {
    const next = normalizeSearchQuery(searchDraft);
    searchViewApplyRef.current = "all";
    setSearchViewPending(true);
    setSearchFavoritesOnly(false);
    setPinnedRecord(null);
    setSearchTerm(next);
    setQueryPage(1);
    setTableFilteredEmpresas(null);
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
    setTableFilteredEmpresas,
  ]);

  const handleSearchApplyFavorites = useCallback(() => {
    searchViewApplyRef.current = "all";
    setSearchViewPending(true);
    setSearchFavoritesOnly(true);
    setPinnedRecord(null);
    setSearchTerm(normalizeSearchQuery(searchDraft));
    setTableFilteredEmpresas(null);
    setSelectedTableItems([]);
  }, [
    searchDraft,
    searchViewApplyRef,
    setPinnedRecord,
    setSearchFavoritesOnly,
    setSearchTerm,
    setSearchViewPending,
    setSelectedTableItems,
    setTableFilteredEmpresas,
  ]);

  const handleSearchResultSelect = useCallback(
    (emp) => {
      if (!emp) return;
      searchViewApplyRef.current = "single";
      setSearchViewPending(true);
      setSearchFavoritesOnly(false);
      setPinnedRecord(emp);
      setSearchTerm(normalizeSearchQuery(searchDraft));
      setTableFilteredEmpresas(null);
      setSelectedTableItems([]);
      setSelectedIndex(0);
      if (showForm && viewMode === "record") {
        setEditingEmp(emp);
      }
    },
    [
      searchDraft,
      searchViewApplyRef,
      setEditingEmp,
      setPinnedRecord,
      setSearchFavoritesOnly,
      setSearchTerm,
      setSearchViewPending,
      setSelectedIndex,
      setSelectedTableItems,
      setTableFilteredEmpresas,
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
