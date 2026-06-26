import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { showError, showInfo } from "@/shared/feedback";
import { printCadastroTable } from "@/ModeloBase1/export";
import { MakMasterHistory } from "@/ModeloBase1/components";
import { MAK_PRINT_PLACEHOLDER_MESSAGE } from "@/framework/mak/ux/makPlaceholderActions";
import {
  MakActionBar,
  MakCardsPanelStrip,
  MakTablePanelStrip,
  MakFilterPanel,
  MakContextPanel,
  MakMobileViewBar,
  useMakChrome,
  applyMgViewMode,
  resolveMgViewMode,
  resolveMgActionBarVisibility,
  buildMgFilterFields,
  buildPanelFilterColumnMap,
} from "@/ModeloBase1/layout";
import { useMakPermissions } from "@/ModeloBase1/permissions";
import { useIsMobile } from "@/hooks/use-mobile";
import { useServerRecordNavigation } from "@/ModeloBase1/pagination";
import {
  LIST_DROPDOWN_MAX_ITEMS,
  LIST_DROPDOWN_MAX_PAGES,
  LIST_SEARCH_DEBOUNCE_MS,
} from "@/shared/listing/listQueryConfig";
import {
  buildMakColumnFilters,
  buildMakPanelFilters,
  mergeMakListFilters,
} from "@/ModeloBase1/filters";
import { normalizeSearchQuery, stableJsonEqual, isPendingRecordId, isErpFilterActive } from "@/ModeloBase1/utils";
import { MetricsApi } from "@/apis/metrics/MetricsApi";
import { useSaveCycle } from "@/ModeloBase1/hooks";
import { syncColumnsIntoPanelFilters, useMakListFilters } from "@/ModeloBase1/filters";
import { useMakSearchHandlers, useMakRecordSubmit, useMakRecordDelete, useMakRecordExport } from "@/ModeloBase1/actions";
import { ModeloBase1Provider, useModeloBase1Config } from "@/ModeloBase1/config";
import { MakModuleProvider } from "@/framework/mak/runtime";

const DROPDOWN_PAGE_SIZE = 30;
function ModeloBase1CadastroPageContent() {
  const config = useModeloBase1Config();
  const hooks = config.hooks;
  const helpers = config.helpers;
  const data = config.data;
  const exp = config.export ?? {};

  const FormPanel = config.components.FormPanel;
  const SearchPanel = config.components.SearchPanel;
  const TablePanel = config.components.TablePanel;
  const Dialogs = config.components.Dialogs;
  const FilterFieldsConfigDialog = config.components.FilterFieldsConfigDialog;

  const module = config.makModule;
  const moduleDefinition = config.moduleDefinition;
  const moduleRepository = moduleDefinition.repository;
  const moduleLabels = config.labels ?? module.labels;
  const MAK_MODULE_ID = config.moduleId;

  const {
    selectorSnapshot,
    selectedScopeId,
    upsertInSelector,
    removeFromSelector,
    replaceInSelector,
  } = hooks.useScopeAuth();

  const makPermissions = useMakPermissions();
  const {
    preferencesReady,
    bootstrapStatus,
    bootstrapGeneration,
    error: preferencesSyncError,
    scheduleListagemSync,
  } = hooks.usePreferencesBootstrap();

  const resolveErrorMessage = (error, fallback) => {
    const apiMessage = error?.data?.message || error?.message;
    if (apiMessage && String(apiMessage).trim()) return String(apiMessage);
    return fallback;
  };

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [] });
  const [showConfigColunas, setShowConfigColunas] = useState(false);
  const [showConfigFiltros, setShowConfigFiltros] = useState(false);
  const [showConfigPdf, setShowConfigPdf] = useState(false);
  const [showConfigExcel, setShowConfigExcel] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { viewMode, setViewMode } = hooks.useViewModePreference("table");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchDraft, setSearchDraft] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [pinnedRecord, setPinnedRecord] = useState(null);
  const [searchFavoritesOnly, setSearchFavoritesOnly] = useState(false);
  const [searchViewPending, setSearchViewPending] = useState(false);
  const searchViewApplyRef = useRef(null);
  const [dropdownSearch, setDropdownSearch] = useState("");
  const [selectedTableItems, setSelectedTableItems] = useState([]);
  const [formVersion, setFormVersion] = useState(0);
  const [returnRecordAfterNew, setReturnRecordAfterNew] = useState(null);
  const [attachmentsRecord, setAttachmentsRecord] = useState(null);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState([]);
  const [visibleTableData, setVisibleTableData] = useState({ columns: [], rows: [] });
  const [tableFilteredRecords, setTableFilteredRecords] = useState(null);
  const [querySort, setQuerySort] = useState(helpers.readInitialQuerySort);
  const [queryPage, setQueryPage] = useState(1);
  const [queryPageSize, setQueryPageSize] = useState(data.infinitePageSize);
  const [loadBatchSize, setLoadBatchSize] = useState(() => data.readStoredLoadBatchSize());
  const [appliedPanelFilters, setAppliedPanelFilters] = useState(undefined);
  const panelFiltersSyncedRef = useRef(false);
  const [columnFilters, setColumnFilters] = useState(helpers.readInitialColumnFiltersState);
  const [columnFiltersHydrated, setColumnFiltersHydrated] = useState(true);
  const columnFiltersRef = useRef(helpers.readInitialColumnFiltersState());
  const appliedFilterValuesRef = useRef({});
  const cardsVisFields = hooks.useCardsVisFields();
  const { data: camposPersonalizados = [] } = hooks.useCustomFields();
  const catalogFilterFields = useMemo(
    () => buildMgFilterFields(camposPersonalizados, module.metadata?.table?.columns ?? []),
    [camposPersonalizados]
  );
  const {
    filterFields,
    layout: filterFieldsLayout,
    saveLayout: saveFilterFieldsLayout,
    getRestoreDefaults: getRestoreFilterFieldsLayout,
    catalogFields: filterFieldsCatalog,
  } = hooks.useFilterFieldsLayout(catalogFilterFields);
  const filterFieldsConfigCatalog = useMemo(
    () =>
      filterFieldsCatalog.map((field) => ({
        id: field.key,
        label: field.label,
      })),
    [filterFieldsCatalog]
  );
  const panelFilterColumnMap = useMemo(
    () => buildPanelFilterColumnMap(filterFieldsCatalog),
    [filterFieldsCatalog]
  );
  const isMobile = useIsMobile();
  const mobileCardsPerRow = 1;
  const effectiveCardsPerRow = isMobile ? mobileCardsPerRow : cardsVisFields.layoutConfig.cardsPerRow;
  const effectiveFieldsPerRow = isMobile
    ? helpers.getFieldsPerRowForLayout(mobileCardsPerRow)
    : cardsVisFields.fieldsPerRow;
  const searchDropdownFields = hooks.useSearchDropdownFields();
  const recordFavorites = hooks.useFavorites();
  const favoriteIds = useMemo(
    () => [...recordFavorites.favorites],
    [recordFavorites.favorites]
  );
  const favoriteIdsKey = useMemo(
    () => favoriteIds.slice().sort().join(","),
    [favoriteIds]
  );
  const {
    filterPanelOpen,
    closeFilterPanel,
    toggleFilterPanel,
    setBreadcrumbSuffix,
  } = useMakChrome();
  const [filterValues, setFilterValues] = useState({});
  const [appliedFilterValues, setAppliedFilterValues] = useState({});
  const [formBridge, setFormBridge] = useState(null);
  const lastPreferencesErrorRef = useRef(null);
  const pendingDeleteIdsRef = useRef([]);
  const pendingCreatesRef = useRef(new Map());
  const previousScopeIdRef = useRef(selectedScopeId);
  const suppressColumnFilterPersistRef = useRef(true);
  const formBridgeSignatureRef = useRef("");
  const queryClient = useQueryClient();
  const saveCycle = useSaveCycle();

  useEffect(() => {
    if (previousScopeIdRef.current === selectedScopeId) return;
    previousScopeIdRef.current = selectedScopeId;
    suppressColumnFilterPersistRef.current = true;
    setShowForm(false);
    setEditingRecord(null);
    setViewMode("table");
    setSelectedTableItems([]);
    setSelectedIndex(0);
    setTableFilteredRecords(null);
    setSearchDraft("");
    setSearchTerm("");
    setPinnedRecord(null);
    setSearchFavoritesOnly(false);
    setDropdownSearch("");
  }, [selectedScopeId]);

  useEffect(() => {
    if (!preferencesReady || catalogFilterFields.length === 0) return;
    if (panelFiltersSyncedRef.current) return;
    if (helpers.isPreferencesSectionDirty("view") || helpers.isPreferencesSectionDirty("table")) return;

    const storedColumnFilters = helpers.readInitialColumnFiltersState();
    const syncedPanelValues = syncColumnsIntoPanelFilters(
      storedColumnFilters,
      panelFilterColumnMap
    );
    panelFiltersSyncedRef.current = true;
    appliedFilterValuesRef.current = syncedPanelValues;
    setFilterValues((current) =>
      stableJsonEqual(current || {}, syncedPanelValues || {}) ? current : syncedPanelValues
    );
    setAppliedFilterValues((current) =>
      stableJsonEqual(current || {}, syncedPanelValues || {}) ? current : syncedPanelValues
    );
    setAppliedPanelFilters((current) => {
      const next = buildMakPanelFilters(MAK_MODULE_ID,syncedPanelValues);
      return stableJsonEqual(current, next) ? current : next;
    });
  }, [catalogFilterFields.length, panelFilterColumnMap, preferencesReady]);

  useEffect(() => {
    if (!preferencesSyncError?.message) return;
    const signature = `${preferencesSyncError.status || "err"}:${preferencesSyncError.message}`;
    if (lastPreferencesErrorRef.current === signature) return;
    lastPreferencesErrorRef.current = signature;
    showError(`Preferências: ${preferencesSyncError.message}`);
  }, [preferencesSyncError]);

  useEffect(() => {
    if (!showForm) {
      setPendingAttachments([]);
      setAttachmentsOpen(false);
    }
  }, [showForm]);

  useEffect(() => {
    columnFiltersRef.current = columnFilters || {};
  }, [columnFilters]);

  useEffect(() => {
    if (!columnFiltersHydrated || suppressColumnFilterPersistRef.current) return;
    helpers.writeStoredTempListagemFilters(columnFilters || {});
  }, [columnFilters, columnFiltersHydrated]);

  useEffect(() => {
    appliedFilterValuesRef.current = appliedFilterValues || {};
  }, [appliedFilterValues]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDropdownSearch(normalizeSearchQuery(searchDraft));
    }, LIST_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const searchDraftNormalized = normalizeSearchQuery(searchDraft);
  const dropdownSearchPending = searchDraftNormalized !== dropdownSearch;

  const {
    data: dropdownPages,
    fetchNextPage: fetchNextDropdownPage,
    hasNextPage: dropdownHasNextPage,
    isFetchingNextPage: dropdownFetchingNextPage,
    isFetching: dropdownSourceFetching,
  } = useInfiniteQuery({
    queryKey: [`${config.dropdownQueryKeyPrefix}`, dropdownSearch, querySort.key, querySort.direction],
    queryFn: ({ pageParam = 1 }) =>
      moduleRepository.listPage({
        page: pageParam,
        pageSize: DROPDOWN_PAGE_SIZE,
        search: dropdownSearch,
        sortBy: querySort.key,
        sortDir: querySort.direction,
      }),
    getNextPageParam: (lastPage, allPages) => {
      if (allPages.length >= LIST_DROPDOWN_MAX_PAGES) return undefined;
      return lastPage.page < lastPage.totalPages ? lastPage.page + 1 : undefined;
    },
    initialPageParam: 1,
    enabled: dropdownSearch.length > 0,
    placeholderData: (previous) => previous,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const dropdownResponse = dropdownPages?.pages?.[0];

  const { data: dropdownFavoritesProbe } = useQuery({
    queryKey: [`${config.dropdownQueryKeyPrefix}-fav`, dropdownSearch, favoriteIdsKey, querySort.key, querySort.direction],
    queryFn: () =>
      moduleRepository.listPage({
        page: 1,
        pageSize: 1,
        search: dropdownSearch,
        sortBy: querySort.key,
        sortDir: querySort.direction,
        filters: { ids: favoriteIds },
      }),
    enabled: dropdownSearch.length > 0 && favoriteIds.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

  const dropdownSearchResults = useMemo(() => {
    if (dropdownSearchPending) return [];
    const flat = dropdownPages?.pages?.flatMap((page) => page.items || []) || [];
    return flat.slice(0, LIST_DROPDOWN_MAX_ITEMS);
  }, [dropdownSearchPending, dropdownPages]);
  const dropdownSearchResultsTotal = dropdownSearchPending ? 0 : dropdownResponse?.total || 0;
  const dropdownSearchHasFavorites = (dropdownFavoritesProbe?.total ?? 0) > 0;

  const dropdownSearchLoading =
    dropdownSearchPending ||
    (dropdownSearch.length > 0 && dropdownSourceFetching && dropdownSearchResults.length === 0);

  const handleSearchLoadMore = useCallback(() => {
    if (!dropdownHasNextPage || dropdownFetchingNextPage) return;
    fetchNextDropdownPage();
  }, [dropdownHasNextPage, dropdownFetchingNextPage, fetchNextDropdownPage]);

  const serverBaseFilters = useMemo(
    () =>
      mergeMakListFilters(MAK_MODULE_ID,
        appliedPanelFilters,
        searchFavoritesOnly ? { ids: favoriteIds } : undefined
      ),
    [appliedPanelFilters, searchFavoritesOnly, favoriteIds]
  );

  const selectorOptionsBaseFilters = useMemo(
    () => mergeMakListFilters(MAK_MODULE_ID,searchFavoritesOnly ? { ids: favoriteIds } : undefined),
    [searchFavoritesOnly, favoriteIds]
  );

  const listFilters = useMemo(
    () =>
      mergeMakListFilters(MAK_MODULE_ID,
        appliedPanelFilters,
        buildMakColumnFilters(MAK_MODULE_ID,columnFilters),
        searchFavoritesOnly ? { ids: favoriteIds } : undefined
      ),
    [appliedPanelFilters, columnFilters, searchFavoritesOnly, favoriteIds]
  );

  const {
    handleSearchInputChange,
    handleSearchClear,
    handleSearchCommit,
    handleSearchApplyAll,
    handleSearchApplyFavorites,
    handleSearchResultSelect,
  } = useMakSearchHandlers({
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
    setTableFilteredRecords: setTableFilteredRecords,
    setSelectedTableItems,
    setQueryPage,
    setSelectedIndex,
    setEditingRecord: setEditingRecord,
  });

  const {
    handleFilterChange,
    handleFilterClear,
    handleFilterApply,
    handleColumnFiltersChange,
  } = useMakListFilters({
    moduleId: module.moduleId,
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
  });

  const {
    records,
    recordsPages,
    recordsResponseTotal,
    recordsLoading,
    recordsFetching,
    isLoading,
    isFetching,
    loadedPagesCount,
    canLoadMoreRows,
    loadedRowsLimitReached,
    maxLoadedRows,
    hasNextRecordsPage,
    isFetchingNextRecordsPage,
    handleLoadMoreRecords,
  } = hooks.useInfiniteListData({
    repository: moduleRepository,
    searchTerm,
    querySort,
    listFilters,
    searchFavoritesOnly,
    favoriteIds,
    queryPage,
    setQueryPage,
    loadBatchSize,
  });

  const totalRecords = pinnedRecord ? 1 : recordsResponseTotal || 0;
  const { data: metricsContadores } = useQuery({
    queryKey: ["metrics-contadores"],
    queryFn: () => MetricsApi.getContadores(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const filteredPanelRecords = useMemo(() => {
    if (pinnedRecord) return [pinnedRecord];
    return records;
  }, [records, pinnedRecord]);

  const recordNav = useServerRecordNavigation({
    items: filteredPanelRecords,
    total: totalRecords,
    page: queryPage,
    pageSize: queryPageSize,
    onPageChange: setQueryPage,
    pinnedRecord,
    disabled: !showForm || viewMode !== "record",
  });

  useEffect(() => {
    if (!showForm || viewMode !== "record" || pinnedRecord) return;
    if (!editingRecord?.id || editingRecord._isDuplicate) return;
    const record = recordNav.currentRecord;
    if (record?.id && record.id !== editingRecord.id) {
      setEditingRecord(record);
      setSelectedTableItems([record.id]);
      setSelectedIndex(recordNav.localIndex);
    }
  }, [
    recordNav.currentRecord?.id,
    recordNav.localIndex,
    showForm,
    viewMode,
    pinnedRecord,
    editingRecord?.id,
    editingRecord?._isDuplicate,
  ]);

  useEffect(() => {
    if (!searchViewPending) return undefined;

    const mode = searchViewApplyRef.current;

    if (mode === "single") {
      if (!pinnedRecord) return undefined;
      let innerId = 0;
      const outerId = requestAnimationFrame(() => {
        innerId = requestAnimationFrame(() => {
          setSearchViewPending(false);
          searchViewApplyRef.current = null;
        });
      });
      return () => {
        cancelAnimationFrame(outerId);
        if (innerId) cancelAnimationFrame(innerId);
      };
    }

    if (mode === "all") {
      if (isLoading || isFetching) return undefined;
      const timer = window.setTimeout(() => {
        setSearchViewPending(false);
        searchViewApplyRef.current = null;
      }, 0);
      return () => window.clearTimeout(timer);
    }

    return undefined;
  }, [searchViewPending, pinnedRecord, isLoading, isFetching, filteredPanelRecords]);

  const handleFilteredRecordsChange = useCallback((filtered) => {
    setTableFilteredRecords((previous) => {
      if (previous === filtered) return previous;
      if (
        previous &&
        filtered &&
        previous.length === filtered.length &&
        previous.every((item, index) => item?.id === filtered[index]?.id)
      ) {
        return previous;
      }
      return filtered;
    });
  }, []);

  const navigationRecords = tableFilteredRecords ?? filteredPanelRecords;

  const refreshNavRecord = useCallback((list, record, navListOverride) => {
    const navList = navListOverride ?? tableFilteredRecords ?? list;
    const fresh = helpers.findRecordInList(list, record) ?? record;
    const navIndex = navList.findIndex(
      (item) => helpers.matchRecordIdentity(item, fresh)
    );
    return { fresh, navList, navIndex };
  }, [searchTerm, tableFilteredRecords]);

  const currentRecord = navigationRecords[selectedIndex] || navigationRecords[0] || null;
  const selectedTableRecord = selectedTableItems.length === 1 ? navigationRecords.find((e) => e.id === selectedTableItems[0]) : null;
  const hasActiveFilters = Boolean(
    appliedPanelFilters ||
    Object.values(columnFilters).some((value) => isErpFilterActive(value)) ||
    Object.values(appliedFilterValues).some((value) => isErpFilterActive(value)) ||
    searchTerm.trim() ||
    searchFavoritesOnly
  );

  const stayOnRecordAfterSave = useCallback((savedRecord) => {
    const normalized = helpers.normalizeRecord(savedRecord);
    const savedId = normalized?.id;

    if (!savedId) {
      setShowForm(true);
      setViewMode("record");
      return;
    }

    setReturnRecordAfterNew(null);
    setEditingRecord(normalized);
    setSelectedTableItems([savedId]);
    setShowForm(true);
    setViewMode("record");

    data.patchListCache(queryClient, (previous) => {
      const exists = previous.items.some((item) => item.id === savedId);
      const items = exists
        ? previous.items.map((item) => (item.id === savedId ? { ...item, ...normalized } : item))
        : [normalized, ...previous.items];
      return {
        ...previous,
        items,
        total: exists ? previous.total : previous.total + 1,
      };
    });

    const navList = tableFilteredRecords ?? filteredPanelRecords;
    const navIndex = navList.findIndex(
      (item) => item.id === savedId || helpers.matchRecordIdentity(item, normalized)
    );
    if (navIndex >= 0) setSelectedIndex(navIndex);

    upsertInSelector(normalized);
  }, [queryClient, tableFilteredRecords, filteredPanelRecords, upsertInSelector]);

  const { handleSubmit } = useMakRecordSubmit({
    editingRecord: editingRecord,
    selectorSnapshot: selectorSnapshot,
    pendingAttachments,
    pendingCreatesRef,
    moduleRepository,
    moduleLabels: module.labels,
    schema: module.schema,
    normalizeRecord: module.normalizeRecord,
    listQueryKey: module.listQueryKey,
    patchListCache: module.patchListCache,
    entityName: module.entityName,
    metricsEntityKey: module.metricsEntityKey,
    queryClient,
    saveCycle,
    resolveErrorMessage,
    stayOnRecordAfterSave,
    setEditingRecord: setEditingRecord,
    setFormVersion,
    setSelectedTableItems,
    upsertInSelector: upsertInSelector,
    removeFromSelector: removeFromSelector,
    replaceInSelector: replaceInSelector,
    setPendingAttachments,
    attachmentPersistErrorMessage: module.attachmentPersistErrorMessage,
  });

  const handleEdit = (emp) => {
    if (!saveCycle.guardAction()) return;
    closeFilterPanel();
    recordNav.syncLocalIndexFromRecord(emp);
    const index = filteredPanelRecords.findIndex((e) => e.id === emp.id);
    if (index >= 0) setSelectedIndex(index);
    setSelectedTableItems([emp.id]);
    setEditingRecord(emp);
    setShowForm(true);
    setViewMode("record");
  };

  const handleNew = () => {
    if (!saveCycle.guardAction()) return;
    closeFilterPanel();
    setReturnRecordAfterNew(showForm && viewMode === "record" ? editingRecord || currentRecord : null);
    setSelectedTableItems([]);
    const alreadyNew = showForm && !editingRecord?.id && !editingRecord?._isDuplicate;
    setEditingRecord(null);
    setShowForm(true);
    setViewMode("record");
    if (alreadyNew) {
      setFormVersion((version) => version + 1);
    }
  };

  const handleDuplicate = (emp) => {
    if (!saveCycle.guardAction()) return;
    closeFilterPanel();
    setReturnRecordAfterNew(showForm && viewMode === "record" ? emp : null);
    setEditingRecord(helpers.buildDuplicateRecord(emp));
    setShowForm(true);
    setViewMode("record");
  };

  const handleRequestDelete = (ids) => {
    if (!saveCycle.guardAction()) return;
    const normalized = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
    pendingDeleteIdsRef.current = normalized;
    setDeleteState({ open: true, ids: normalized });
  };

  const handleDistinctColumnValues = useCallback(
    (params) => moduleRepository.listDistinctColumnValues(params),
    []
  );

  const handleServerPageChange = useCallback((nextPage) => {
    const safePage = Math.max(1, Number(nextPage) || 1);
    setQueryPage(safePage);
  }, []);

  const handleLoadBatchSizeChange = useCallback((nextBatchSize) => {
    setLoadBatchSize(nextBatchSize);
    setQueryPage(1);
    if (typeof window !== "undefined") {
      helpers.writePreferencesText(data.loadBatchStorageKey, String(nextBatchSize), {
        reason: "listagem:table-batch-size",
      });
    }
    if (preferencesReady) {
      scheduleListagemSync({
        immediate: true,
        reason: "listagem:table-batch-size",
        sections: ["table"],
      });
    }
  }, [preferencesReady, scheduleListagemSync]);

  const handleServerPageSizeChange = useCallback(() => {
    setQueryPageSize(data.infinitePageSize);
    setQueryPage(1);
  }, []);

  const handleServerSortChange = useCallback((nextSort) => {
    setQuerySort((previous) => {
      const key = nextSort?.key || helpers.readInitialQuerySort().key;
      const direction = nextSort?.direction === "desc" ? "desc" : "asc";
      if (previous.key === key && previous.direction === direction) return previous;
      return { key, direction };
    });
    setQueryPage(1);
  }, []);

  const mgViewMode = resolveMgViewMode({ showForm, viewMode });

  useEffect(() => {
    if (showForm || viewMode !== "record") return;
    setViewMode("table");
  }, [showForm, viewMode, setViewMode]);

  const searchHasFilter = Boolean(
    searchDraft.trim() || searchTerm.trim() || pinnedRecord || searchFavoritesOnly
  );
  const searchIconLoading = dropdownSearchLoading || searchViewPending;

  const actionBarVisibility = useMemo(
    () =>
      resolveMgActionBarVisibility({
        showForm,
        formBridge,
        selectedCount: selectedTableItems.length,
        hasRecord: !!editingRecord?.id,
      }),
    [showForm, formBridge, selectedTableItems.length, editingRecord?.id]
  );

  const loadedRecordsCount = filteredPanelRecords.length;
  const filteredRecordsCount = Math.max(Number(totalRecords || 0), loadedRecordsCount);
  const totalRecordsCount = Math.max(
    Number(metricsContadores?.[config.metricsCounterKey] || 0),
    filteredRecordsCount,
    loadedRecordsCount
  );

  useEffect(() => {
    if (actionBarVisibility.secondaryToolsLocked) {
      closeFilterPanel();
    }
  }, [actionBarVisibility.secondaryToolsLocked, closeFilterPanel]);

  useEffect(() => {
    if (!showForm) {
      formBridgeSignatureRef.current = "";
      setFormBridge(null);
    }
  }, [showForm]);

  const handleToolbarBridge = useCallback((bridge) => {
    const sig = [
      bridge?.editMode,
      bridge?.isReadOnly,
      bridge?.isEditing,
      bridge?.isDuplicating,
      bridge?.layoutConfigOpen,
      bridge?.recordMeta?.codigo ?? "",
      bridge?.recordMeta?.nome ?? "",
      bridge?.layoutToolbar ? "1" : "0",
    ].join("|");
    if (formBridgeSignatureRef.current === sig) return;
    formBridgeSignatureRef.current = sig;
    setFormBridge(bridge);
  }, []);

  useEffect(() => {
    if (showForm && formBridge?.layoutConfigOpen) {
      setBreadcrumbSuffix("Configuração de layout");
      return () => setBreadcrumbSuffix(null);
    }
    setBreadcrumbSuffix(null);
    return undefined;
  }, [showForm, formBridge?.layoutConfigOpen, setBreadcrumbSuffix]);

  const closeTransientDialogs = useCallback(() => {
    setShowConfigColunas(false);
    setShowConfigFiltros(false);
    setShowConfigPdf(false);
    setShowConfigExcel(false);
  }, []);

  const handleOpenTableView = useCallback(() => {
    closeTransientDialogs();
    if (showForm) {
      setShowForm(false);
      setEditingRecord(null);
      setSelectedTableItems([]);
    }
    setViewMode("table");
  }, [closeTransientDialogs, showForm]);

  const handleMgViewModeChange = useCallback(
    (mode) => {
      if (saveCycle.isSaving || actionBarVisibility.secondaryToolsLocked) return;
      applyMgViewMode(mode, {
        onOpenRegistro: () => {
          closeTransientDialogs();
          if (showForm && viewMode === "record") return;
          const emp = selectedTableRecord || navigationRecords[selectedIndex] || navigationRecords[0];
          if (!emp) {
            handleNew();
            return;
          }
          handleEdit(emp);
        },
        onOpenTabela: () => {
          closeTransientDialogs();
          setShowForm(false);
          setEditingRecord(null);
          setSelectedTableItems([]);
          setViewMode("table");
        },
        onOpenCards: () => {
          closeTransientDialogs();
          if (!saveCycle.guardAction()) return;
          setShowForm(false);
          setEditingRecord(null);
          setSelectedTableItems([]);
          setViewMode("search");
        },
      });
    },
    [
      navigationRecords,
      closeTransientDialogs,
      handleEdit,
      handleNew,
      saveCycle,
      actionBarVisibility.secondaryToolsLocked,
      selectedIndex,
      selectedTableRecord,
      showForm,
      viewMode,
    ]
  );

  useEffect(() => {
    if (!preferencesReady) return undefined;
    const shouldSkipSync = (reason = "", detail = {}) => {
      const normalized = String(reason || "").toLowerCase();
      if (helpers.isRemoteTabPreferenceEvent(detail)) return true;
      return (
        normalized.includes("hydrate") ||
        normalized.includes("bootstrap") ||
        normalized.includes("batch") ||
        normalized.includes("migration") ||
        normalized.includes("remote-tab") ||
        normalized.includes("remote-sync")
      );
    };
    const shouldTrackSyncReason = (reason = "") => {
      const normalized = String(reason || "").toLowerCase();
      if (!normalized) return false;
      if (normalized === "storage") return false;
      if (!normalized.startsWith("listagem:")) return false;
      return !normalized.includes("temp-filters");
    };
    const unsubscribe = helpers.subscribePreferencesCache((detail) => {
      const reason = detail?.reason;
      if (shouldSkipSync(reason, detail)) return;
      if (!shouldTrackSyncReason(reason)) return;
      scheduleListagemSync({ reason });
    });
    return () => {
      unsubscribe();
    };
  }, [preferencesReady, scheduleListagemSync]);

  useEffect(() => {
    if (!showForm || viewMode !== "record" || !editingRecord || editingRecord?._isDuplicate) return;
    if (navigationRecords.length === 0) return;

    const currentFilteredIndex = editingRecord.id
      ? navigationRecords.findIndex((item) => item.id === editingRecord.id)
      : -1;

    if (currentFilteredIndex >= 0) {
      if (selectedIndex !== currentFilteredIndex) setSelectedIndex(currentFilteredIndex);
      const fresh = navigationRecords[currentFilteredIndex];
      if (fresh?.id === editingRecord.id && fresh.updatedAt !== editingRecord.updatedAt) {
        setEditingRecord(fresh);
      }
      return;
    }

    const stillExists = records.some((item) => item.id === editingRecord.id);
    if (!stillExists && navigationRecords.length > 0) {
      const fallbackIndex = Math.min(Math.max(selectedIndex, 0), navigationRecords.length - 1);
      const fallbackRecord = navigationRecords[fallbackIndex];
      if (fallbackRecord) {
        setEditingRecord(fallbackRecord);
        setSelectedIndex(fallbackIndex);
        setSelectedTableItems([fallbackRecord.id]);
      }
    }
  }, [showForm, viewMode, navigationRecords, records, editingRecord?.id, editingRecord?.updatedAt, editingRecord?._isDuplicate, selectedIndex]);

  const handleTableSelectionChange = useCallback((ids) => {
    setSelectedTableItems((p) => { const same = p.length === ids.length && p.every((id, i) => id === ids[i]); return same ? p : ids; });
    if (ids.length === 1) {
      const i = navigationRecords.findIndex((e) => e.id === ids[0]);
      if (i >= 0) {
        setSelectedIndex(i);
      }
    }
  }, [navigationRecords]);

  const handleToggleSearchView = useCallback(() => {
    if (!saveCycle.guardAction()) return;
    if (viewMode === "search") {
      handleOpenTableView();
      return;
    }
    closeTransientDialogs();
    setShowForm(false);
    setEditingRecord(null);
    setViewMode("search");
  }, [closeTransientDialogs, handleOpenTableView, saveCycle, viewMode]);

  const handleToggleView = () => {
    if (!saveCycle.guardAction()) return;
    if (viewMode === "search") {
      if (selectedTableItems.length > 1) return;
      closeTransientDialogs();
      const emp = selectedTableRecord || navigationRecords[selectedIndex] || navigationRecords[0];
      if (!emp) return;
      const index = navigationRecords.findIndex((e) => e.id === emp.id);
      if (index >= 0) setSelectedIndex(index);
      setEditingRecord(emp);
      setShowForm(true);
      setViewMode("record");
      return;
    }
    if (showForm) {
      handleOpenTableView();
      return;
    }
    if (selectedTableItems.length > 1) return;
    closeTransientDialogs();
    const emp = selectedTableRecord || navigationRecords[selectedIndex] || navigationRecords[0];
    if (!emp) return;
    const index = navigationRecords.findIndex((e) => e.id === emp.id);
    if (index >= 0) setSelectedIndex(index);
    setEditingRecord(emp);
    setShowForm(true);
    setViewMode("record");
  };

  const navigateRecord = (direction) => {
    if (!showForm || !saveCycle.guardAction()) return;
    if (direction === "first") recordNav.navigateFirst();
    else if (direction === "last") recordNav.navigateLast();
    else if (direction === "prev") recordNav.navigatePrevious();
    else recordNav.navigateNext();
  };

  const { handleConfirmDelete } = useMakRecordDelete({
    deleteState,
    setDeleteState,
    pendingDeleteIdsRef,
    pendingCreatesRef,
    moduleRepository,
    moduleLabels: module.labels,
    listQueryKey: module.listQueryKey,
    patchListCache: module.patchListCache,
    metricsEntityKey: module.metricsEntityKey,
    queryClient,
    saveCycle,
    resolveErrorMessage,
    showForm,
    viewMode,
    editingRecord: editingRecord,
    selectorState: selectorSnapshot,
    navigationList: navigationRecords,
    attachmentsRecord,
    selectedTableItems,
    findRecordInList: module.findRecordInList,
    refreshNavRecord,
    removeFromSelector: removeFromSelector,
    replaceInSelector: replaceInSelector,
    setShowForm,
    setEditingRecord: setEditingRecord,
    setViewMode,
    setSelectedTableItems,
    setSelectedIndex,
    setFormVersion,
    setAttachmentsRecord,
    setAttachmentsOpen,
  });

  const { exportBusy, exportMessage, handleExportPdf, handleExportExcel } = useMakRecordExport({
    moduleRepository,
    moduleLabels: module.labels,
    saveCycle,
    resolveErrorMessage,
    searchTerm,
    querySort,
    listFilters,
    selectedTableItems,
    pinnedRecord,
    visibleTableData,
    getPdfExportConfig: module.getPdfExportConfig,
    buildExportRows: module.buildExportRows,
  });

  const handlePrint = useCallback(() => {
    const printTitle = `${moduleLabels.title} - ${new Date().toLocaleDateString("pt-BR")}`;
    const singleRecord =
      showForm && editingRecord
        ? editingRecord
        : pinnedRecord || (selectedTableItems.length === 1 ? selectedTableRecord : null);

    if (singleRecord) {
      const config = exp.getPdfExportConfig();
      const srcCols = config.useConfiguredColumns
        ? visibleTableData.allColumns || visibleTableData.columns
        : visibleTableData.columns;
      const selCols =
        config.useConfiguredColumns && config.columnIds.length
          ? srcCols.filter((c) => config.columnIds.includes(c.id))
          : srcCols;
      const rows = helpers.buildExportRows([singleRecord], selCols);
      printCadastroTable({ columns: selCols, rows, totalRows: [], title: printTitle });
      return;
    }

    if (visibleTableData.rows?.length && visibleTableData.columns?.length) {
      printCadastroTable({
        columns: visibleTableData.columns,
        rows: visibleTableData.selectedRows?.length
          ? visibleTableData.selectedRows
          : visibleTableData.rows,
        totalRows: visibleTableData.totalRows || [],
        title: printTitle,
      });
      return;
    }

    showInfo(MAK_PRINT_PLACEHOLDER_MESSAGE);
  }, [
    editingRecord,
    pinnedRecord,
    selectedTableRecord,
    selectedTableItems.length,
    showForm,
    visibleTableData,
  ]);

  const handleOpenHistory = useCallback(() => {
    if (showForm && editingRecord?.id) {
      setHistoryOpen(true);
      return;
    }
    if (selectedTableItems.length === 1 && selectedTableRecord) {
      setHistoryOpen(true);
      return;
    }
    setHistoryOpen(true);
  }, [editingRecord?.id, selectedTableRecord, selectedTableItems.length, showForm]);

  const formCancel = () => {
    if (editingRecord && !editingRecord._isDuplicate) {
      setFormVersion((p) => p + 1);
      setViewMode("record");
      return;
    }
    if ((editingRecord?._isDuplicate || !editingRecord) && returnRecordAfterNew) {
      setEditingRecord(returnRecordAfterNew);
      setShowForm(true);
      setViewMode("record");
      setReturnRecordAfterNew(null);
      return;
    }
    setShowForm(false);
    setEditingRecord(null);
    setViewMode("table");
    setSelectedTableItems([]);
    setReturnRecordAfterNew(null);
  };

  const recordCode = formBridge?.recordMeta?.codigo
    ? String(formBridge.recordMeta.codigo).padStart(6, "0")
    : helpers.getRecordCode(editingRecord);
  const recordTitle = helpers.getRecordTitle(editingRecord, moduleLabels, formBridge, {
    showForm,
    isDuplicating: editingRecord?._isDuplicate,
    isNew: showForm && !editingRecord?.id && !editingRecord?._isDuplicate,
  });

  const filterControlsDisabled = saveCycle.isSaving || actionBarVisibility.secondaryToolsLocked;
  const preferencesDegraded =
    bootstrapStatus === "fallback_local" || Boolean(preferencesSyncError?.message);

  return (
    <MakModuleProvider module={module}>
      <div className={`${config.scopeCssClass} flex h-full min-h-0 flex-1 flex-col overflow-hidden`}>
      {preferencesDegraded ? (
        <div className="border-b border-amber-200 bg-amber-50 px-3 py-1.5 text-xs text-amber-900">
          Preferências remotas indisponíveis no momento. A tela continua com configurações locais.
        </div>
      ) : null}
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <MakFilterPanel
          open={filterPanelOpen}
          values={filterValues}
          onChange={handleFilterChange}
          onClose={closeFilterPanel}
          onClear={handleFilterClear}
          onApply={handleFilterApply}
          disabled={filterControlsDisabled}
        />

        <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
          <div className="mg-subtoolbar-stack">
            <MakActionBar
            viewMode={mgViewMode}
            onViewModeChange={handleMgViewModeChange}
            searchInputValue={searchDraft}
            onSearchInputChange={handleSearchInputChange}
            searchResults={dropdownSearchResults}
            searchResultsTotal={dropdownSearchResultsTotal}
            searchHasFavoritesInResults={dropdownSearchHasFavorites}
            searchDetailFields={searchDropdownFields.detailFields}
            searchLoading={searchIconLoading}
            searchLoadingMore={dropdownFetchingNextPage}
            searchHasMore={Boolean(dropdownHasNextPage)}
            onSearchLoadMore={handleSearchLoadMore}
            searchHasFilter={searchHasFilter}
            onSearchClear={handleSearchClear}
            searchDropdownConfigFields={searchDropdownFields.configFields}
            onSearchDropdownConfigSave={searchDropdownFields.saveConfig}
            onSearchDropdownConfigRestore={searchDropdownFields.getRestoreDefaults}
            onSearchResultSelect={handleSearchResultSelect}
            onSearchApplyAll={handleSearchApplyAll}
            onSearchApplyFavorites={handleSearchApplyFavorites}
            isFavoriteRecord={recordFavorites.isFavorite}
            onToggleFilter={toggleFilterPanel}
            filterActive={hasActiveFilters}
            showFilterToggle={!showForm}
            onNew={makPermissions.canCreate ? handleNew : undefined}
            onSave={formBridge?.onSave}
            onCancel={formBridge?.onCancel ?? formCancel}
            onEdit={
              makPermissions.canEdit
                ? showForm
                  ? formBridge?.onEdit
                  : () => selectedTableRecord && handleEdit(selectedTableRecord)
                : undefined
            }
            onDelete={
              makPermissions.canDelete
                ? showForm
                  ? () => editingRecord?.id && handleRequestDelete(editingRecord.id)
                  : () => selectedTableItems.length > 0 && handleRequestDelete(selectedTableItems)
                : undefined
            }
            onDuplicate={
              makPermissions.canEdit
                ? showForm
                  ? () => editingRecord && handleDuplicate(editingRecord)
                  : () => selectedTableRecord && handleDuplicate(selectedTableRecord)
                : undefined
            }
            onAttach={() => {
              if (showForm) {
                setAttachmentsOpen(true);
                return;
              }
              if (selectedTableRecord) {
                setAttachmentsRecord(selectedTableRecord);
                setAttachmentsOpen(true);
              }
            }}
            attachDisabled={!showForm && selectedTableItems.length !== 1}
            onExportExcel={makPermissions.canExport ? handleExportExcel : undefined}
            onExportPdf={makPermissions.canExport ? handleExportPdf : undefined}
            onPrint={handlePrint}
            onHistory={handleOpenHistory}
            onConfigColumns={() => setShowConfigColunas(true)}
            onLayoutConfig={formBridge?.onLayoutConfig}
            actionsLocked={saveCycle.isSaving}
            secondaryToolsLocked={actionBarVisibility.secondaryToolsLocked}
            layoutConfigMode={!!formBridge?.layoutConfigOpen && !!formBridge?.layoutToolbar}
            layoutToolbar={formBridge?.layoutToolbar}
            {...actionBarVisibility}
            />

            <div className={`mg-context-panel-wrap${showForm && !formBridge?.layoutConfigOpen ? " is-visible" : ""}`}>
              <MakContextPanel
                code={recordCode}
                title={recordTitle}
                total={recordNav.effectiveTotal}
                currentIndex={recordNav.globalIndex}
                onFirst={() => navigateRecord("first")}
                onPrevious={() => navigateRecord("prev")}
                onNext={() => navigateRecord("next")}
                onLast={() => navigateRecord("last")}
                disabled={saveCycle.isSaving}
                interactionLocked={actionBarVisibility.secondaryToolsLocked}
                recordId={editingRecord?.id ?? null}
                isFavorite={editingRecord?.id ? recordFavorites.isFavorite(editingRecord.id) : false}
                onToggleFavorite={() => {
                  if (editingRecord?.id) recordFavorites.toggleFavorite(editingRecord.id);
                }}
              />
            </div>

            <div className={`mg-cards-panel-wrap${!showForm && mgViewMode === "cards" ? " is-visible" : ""}`}>
              <MakCardsPanelStrip
                fields={cardsVisFields.configFields}
                onSave={cardsVisFields.saveConfig}
                onRestoreDefaults={cardsVisFields.getRestoreDefaults}
                layout={cardsVisFields.layoutConfig}
                onSaveLayout={cardsVisFields.saveLayoutConfig}
                onRestoreLayoutDefaults={cardsVisFields.getRestoreLayoutDefaults}
                filterFields={filterFields}
                empresas={filteredPanelRecords}
                filterValues={filterValues}
                appliedFilterValues={appliedFilterValues}
                onFilterChange={handleFilterChange}
                onFilterClear={handleFilterClear}
                onFilterApply={handleFilterApply}
                disabled={filterControlsDisabled}
                onConfigureFilters={() => setShowConfigFiltros(true)}
                filterPanelActive={showConfigFiltros}
                hasActiveFilters={hasActiveFilters}
                onRequestDistinctColumnValues={handleDistinctColumnValues}
                selectorOptionsContextFilters={selectorOptionsBaseFilters}
                columnFilters={columnFilters}
                serverSearchTerm={searchTerm}
                selectorOptionsMode="cascade"
              />
            </div>

            <div className={`mg-table-panel-wrap${!showForm && mgViewMode === "tabela" ? " is-visible" : ""}`}>
              <MakTablePanelStrip
                onConfigColumns={() => setShowConfigColunas(true)}
                disabled={filterControlsDisabled}
                filterFields={filterFields}
                empresas={filteredPanelRecords}
                filterValues={filterValues}
                appliedFilterValues={appliedFilterValues}
                onFilterChange={handleFilterChange}
                onFilterClear={handleFilterClear}
                onFilterApply={handleFilterApply}
                onConfigureFilters={() => setShowConfigFiltros(true)}
                filterPanelActive={showConfigFiltros}
                hasActiveFilters={hasActiveFilters}
                onRequestDistinctColumnValues={handleDistinctColumnValues}
                selectorOptionsContextFilters={selectorOptionsBaseFilters}
                columnFilters={columnFilters}
                serverSearchTerm={searchTerm}
                selectorOptionsMode="cascade"
              />
            </div>
          </div>

          <div className="mg-view-stack flex min-h-0 flex-1 flex-col overflow-hidden">
            {showForm ? (
              <div
                className="mg-view-layer mg-view-layer--form mg-view-layer--active mg-view-panel flex min-h-0 flex-1 flex-col overflow-hidden"
                aria-hidden={false}
              >
                <FormPanel
                  formProps={{
                    initialData: editingRecord,
                    recordKey: editingRecord?.id ?? (editingRecord?._isDuplicate ? "duplicate" : "new"),
                    resetSeed: formVersion,
                    isEditing: !!editingRecord,
                    onSubmit: handleSubmit,
                    onCancel: formCancel,
                    hideToolbar: true,
                    onToolbarBridge: handleToolbarBridge,
                    total: recordNav.effectiveTotal,
                    currentIndex: recordNav.globalIndex,
                    onFirst: () => navigateRecord("first"),
                    onPrevious: () => navigateRecord("prev"),
                    onNext: () => navigateRecord("next"),
                    onLast: () => navigateRecord("last"),
                    onDelete: () => editingRecord?.id && handleRequestDelete(editingRecord.id),
                    onDuplicate: () => editingRecord && handleDuplicate(editingRecord),
                    actionsLocked: saveCycle.isSaving,
                  }}
                />
              </div>
            ) : (
              <>
                <div
                  className={`mg-view-layer mg-view-layer--cards flex min-h-0 flex-1 flex-col overflow-hidden${
                    mgViewMode === "cards" ? " mg-view-layer--active" : ""
                  }`}
                  aria-hidden={mgViewMode !== "cards"}
                >
                  <div id="mode-cards" className="mg-view-panel flex min-h-0 flex-1 flex-col overflow-hidden">
                    <SearchPanel
                      searchProps={{
                        empresas: filteredPanelRecords,
                        total: totalRecords,
                        isLoading: recordsLoading,
                        isFetching: recordsFetching,
                        page: queryPage,
                        pageSize: queryPageSize,
                        onPageChange: handleServerPageChange,
                        onPageSizeChange: handleServerPageSizeChange,
                        searchValue: searchTerm,
                        onSearchChange: handleSearchCommit,
                        onEdit: handleEdit,
                        selectedIds: selectedTableItems,
                        onSelectionChange: handleTableSelectionChange,
                        cardsDetailFields: cardsVisFields.detailFields,
                        cardsPerRow: effectiveCardsPerRow,
                        fieldsPerRow: effectiveFieldsPerRow,
                        isFavoriteRecord: recordFavorites.isFavorite,
                        onToggleFavorite: recordFavorites.toggleFavorite,
                        mgPrototype: true,
                        infiniteMode: true,
                        hasMoreRows: hasNextRecordsPage && canLoadMoreRows,
                        onLoadMoreRows: handleLoadMoreRecords,
                        isLoadingMoreRows: isFetchingNextRecordsPage,
                        loadedRowsLimitReached,
                        maxLoadedRows,
                        loadBatchSize,
                        onLoadBatchSizeChange: handleLoadBatchSizeChange,
                        selectedCount: selectedTableItems.length,
                        listedCount: loadedRecordsCount,
                        filteredCount: filteredRecordsCount,
                        totalCount: totalRecordsCount,
                      }}
                    />
                  </div>
                </div>
                <div
                  className={`mg-view-layer mg-view-layer--table mg-grid-wrapper mg-view-panel flex min-h-0 flex-1 flex-col overflow-hidden${
                    mgViewMode === "tabela" ? " mg-view-layer--active" : ""
                  }`}
                  aria-hidden={mgViewMode !== "tabela"}
                >
                  <TablePanel
                    tableProps={{
                      key: config.tableKey ?? `tbl-${MAK_MODULE_ID}`,
                      empresas: filteredPanelRecords,
                      isLoadingEmpresas: recordsLoading,
                      isFetchingEmpresas: recordsFetching,
                      onEdit: handleEdit,
                      showConfigColunas,
                      setShowConfigColunas,
                      searchTerm: "",
                      selectedRecordId: undefined,
                      selectedIds: selectedTableItems,
                      onSelectionChange: handleTableSelectionChange,
                      onVisibleDataChange: setVisibleTableData,
                      onFilteredEmpresasChange: handleFilteredRecordsChange,
                      onServerColumnFiltersChange: handleColumnFiltersChange,
                      externalColumnFilters: columnFiltersHydrated ? columnFilters : undefined,
                      serverPage: queryPage,
                      serverPageSize: queryPageSize,
                      serverTotal: totalRecords,
                      onServerPageChange: handleServerPageChange,
                      onServerPageSizeChange: handleServerPageSizeChange,
                      serverSearchTerm: searchTerm,
                      serverBaseFilters,
                      selectorOptionsMode: "cascade",
                      selectorOptionsContextFilters: serverBaseFilters,
                      onServerSortChange: handleServerSortChange,
                      onRequestDistinctColumnValues: handleDistinctColumnValues,
                      preferencesReady,
                      bootstrapGeneration,
                      moduleTitle: moduleLabels.title,
                      mgPrototype: true,
                      infiniteMode: true,
                      hasMoreRows: hasNextRecordsPage && canLoadMoreRows,
                      onLoadMoreRows: handleLoadMoreRecords,
                      isLoadingMoreRows: isFetchingNextRecordsPage,
                      loadedRowsLimitReached,
                      maxLoadedRows,
                      loadBatchSize,
                      onLoadBatchSizeChange: handleLoadBatchSizeChange,
                      selectedCount: selectedTableItems.length,
                      listedCount: loadedRecordsCount,
                      filteredCount: filteredRecordsCount,
                      totalCount: totalRecordsCount,
                    }}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <MakMobileViewBar
        value={mgViewMode}
        onChange={handleMgViewModeChange}
        disabled={saveCycle.isSaving || actionBarVisibility.secondaryToolsLocked}
      />

      {FilterFieldsConfigDialog ? (
      <FilterFieldsConfigDialog
        open={showConfigFiltros}
        onOpenChange={setShowConfigFiltros}
        moduleTitle={moduleLabels.title}
        camposDisponiveis={filterFieldsConfigCatalog}
        camposVisiveis={filterFieldsLayout.visiveis}
        camposOrdem={filterFieldsLayout.ordem}
        onChange={saveFilterFieldsLayout}
        getRestoreDefaults={getRestoreFilterFieldsLayout}
      />
      ) : null}

      {Dialogs ? (
      <Dialogs
        exportPdfProps={{
          open: showConfigPdf,
          onOpenChange: setShowConfigPdf,
          columns: visibleTableData.allColumns || visibleTableData.columns || [],
          initialConfig: exp.getPdfExportConfig(),
          tipo: "pdf",
          onSaveConfig: (config) => exp.savePdfExportConfig(config),
        }}
        exportExcelProps={{
          open: showConfigExcel,
          onOpenChange: setShowConfigExcel,
          columns: visibleTableData.allColumns || visibleTableData.columns || [],
          initialConfig: exp.getExcelExportConfig(),
          tipo: "excel",
          onSaveConfig: (config) => exp.saveExcelExportConfig(config),
        }}
        anexosProps={{
          open: attachmentsOpen,
          onOpenChange: (open) => {
            setAttachmentsOpen(open);
            if (!open && !showForm) setAttachmentsRecord(null);
          },
          entityName: moduleDefinition.entityName,
          recordId:
            showForm && editingRecord?.id && !isPendingRecordId(editingRecord.id)
              ? editingRecord.id
              : !showForm
                ? attachmentsRecord?.id
                : undefined,
          title:
            (showForm
              ? helpers.getAttachmentTitle(editingRecord)
              : helpers.getAttachmentTitle(attachmentsRecord)) ||
            moduleLabels.singular,
          pendingAnexos: pendingAttachments,
          onPendingChange: setPendingAttachments,
        }}
        confirmDeleteProps={{
          open: deleteState.open,
          onOpenChange: (open) => setDeleteState((previous) => ({ ...previous, open })),
          title: "Confirmar exclusão",
          description:
            deleteState.ids.length > 1
              ? `Deseja excluir ${deleteState.ids.length} ${moduleLabels.plural.toLowerCase()}?`
              : `Deseja excluir esta ${moduleLabels.singular.toLowerCase()}?`,
          confirmText: "Excluir",
          cancelText: "Cancelar",
          variant: "destructive",
          onConfirm: handleConfirmDelete,
        }}
      />
      ) : null}
        <MakMasterHistory
          open={historyOpen}
          onOpenChange={setHistoryOpen}
          moduleLabel={moduleLabels.singular}
          recordCode={recordCode || null}
          recordTitle={recordTitle || null}
        />
      </div>
    </MakModuleProvider>
  );
}

/** Motor ModeloBase1 — cadastro enterprise reutilizável (motor único infinite). */
export default function ModeloBase1CadastroPage({ config }) {
  if (!config) {
    throw new Error("ModeloBase1CadastroPage: prop config é obrigatória");
  }
  return (
    <ModeloBase1Provider config={config}>
      <ModeloBase1CadastroPageContent />
    </ModeloBase1Provider>
  );
}
