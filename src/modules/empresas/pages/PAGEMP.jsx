import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError, showInfo } from "@/shared/feedback";
import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { findEmpresaInList, normalizeEmpresaRecord } from "@/modules/empresas/utils/empCodigoUtils";
import { useAuth } from "@/shared/contexts/AuthContext";
import { printCadastroTable } from "@/framework/cadastro/exports/tableExportUtils";
import { MakMasterHistory } from "@/framework/mak/ux";
import { MAK_PRINT_PLACEHOLDER_MESSAGE } from "@/framework/mak/ux/makPlaceholderActions";
import {
  getEmpPdfExportConfig,
  getEmpExcelExportConfig,
  saveEmpExcelExportConfig,
  saveEmpPdfExportConfig,
} from "@/modules/empresas/config/empPdfExportConfig";
import {
  EmpresasDialogs,
  EmpresasFormPanel,
  EmpresasSearchPanel,
  EmpresasTablePanel,
} from "./PAGEMP.sections";
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
} from "@/framework/mak/layout";
import { useMakPermissions } from "@/framework/mak/permissions";
import { useEmpCardsVisFields } from "@/modules/empresas/hooks/useEmpCardsVisFields";
import { getFieldsPerRowForLayout } from "@/modules/empresas/components/empSearchView.constants";
import { useEmpSearchDropdownFields } from "@/modules/empresas/hooks/useEmpSearchDropdownFields";
import { useEmpFavorites } from "@/modules/empresas/hooks/useEmpFavorites";
import {
  EMP_INFINITE_PAGE_SIZE,
  EMP_LOAD_BATCH_STORAGE_KEY,
  readStoredEmpLoadBatchSize,
  useEmpresasInfiniteData,
} from "@/modules/empresas/hooks/useEmpresasInfiniteData";
import { useIsMobile } from "@/hooks/use-mobile";
import { useServerRecordNavigation } from "@/shared/hooks/useServerRecordNavigation";
import {
  LIST_DROPDOWN_MAX_ITEMS,
  LIST_DROPDOWN_MAX_PAGES,
  LIST_SEARCH_DEBOUNCE_MS,
} from "@/shared/listing/listQueryConfig";
import {
  buildMakColumnFilters,
  buildMakPanelFilters,
  mergeMakListFilters,
} from "@/framework/mak/filters";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";
import { buildEmpresaExportRows } from "@/modules/empresas/utils/empExportRows";
import { patchMetricsCache, setMetricsCache } from "@/apis/metrics/metricsCache";
import { MetricsApi } from "@/apis/metrics/MetricsApi";
import { isPendingRecordId } from "@/shared/utils/pendingRecordUtils";
import { useSaveCycle } from "@/shared/hooks/useSaveCycle";
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import { useEmpFilterFieldsLayout } from "@/modules/empresas/hooks/useEmpFilterFieldsLayout";
import EmpConfiguracaoFiltrosDialog from "@/modules/empresas/components/EmpConfiguracaoFiltrosDialog";
import { isErpFilterActive } from "@/shared/filters";
import { patchEmpresasCache } from "@/modules/empresas/data/empresasListCache";
import { syncColumnsIntoPanelFilters } from "@/framework/mak/listing/syncPanelColumnFilters";
import { useMakListFilters } from "@/framework/mak/listing/useMakListFilters";
import { useMakSearchHandlers } from "@/framework/mak/listing/useMakSearchHandlers";
import { useMakRecordSubmit, useMakRecordDelete, useMakRecordExport } from "@/framework/mak/records";
import { empresasMakRuntime } from "@/modules/empresas/config/empresasMakRuntime";
import { useEmpresasPreferencesBootstrapState } from "@/modules/empresas/preferences/EmpresasPreferencesBootstrapContext";
import { useEmpViewModePreference } from "@/modules/empresas/hooks/useEmpViewModePreference";
import { isRemoteTabPreferenceEvent } from "@/modules/empresas/preferences/empresasPreferencesCrossTab";
import {
  readStoredTempListagemFilters,
  writeStoredTempListagemFilters,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";
import { isEmpPreferencesSectionDirty } from "@/modules/empresas/preferences/empresasPreferencesScopeState";
import { stableJsonEqual } from "@/shared/utils/stableStringify";
import {
  subscribeEmpPreferencesCache,
  readEmpPreferencesJson,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
import {
  SORT_KEY,
} from "@/modules/empresas/components/tblEmp.constants";

const DROPDOWN_PAGE_SIZE = 30;
const MAK_MODULE_ID = "empresas";

const readInitialQuerySort = () => {
  const storedSort = readEmpPreferencesJson(SORT_KEY, null);
  const primarySort = Array.isArray(storedSort)
    ? storedSort.find((item) => item?.key)
    : storedSort?.key
      ? storedSort
      : null;
  if (primarySort?.key) {
    return {
      key: primarySort.key,
      direction: primarySort.direction === "desc" ? "desc" : "asc",
    };
  }
  return { key: "codempresa", direction: "asc" };
};

const readInitialColumnFiltersState = () => {
  const stored = readStoredTempListagemFilters();
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    return stored;
  }
  return {};
};

const moduleRepository = empresasModuleDefinition.repository;
const moduleLabels = {
  singular: empresasModuleDefinition.singularLabel,
  plural: empresasModuleDefinition.pluralLabel,
  title: `Cadastro de ${empresasModuleDefinition.pluralLabel}`,
};

export default function PAGEMP() {
  const makPermissions = useMakPermissions();
  const {
    user,
    empresas: empresasSelector,
    selectedEmpresaId,
    upsertEmpresaInSelector,
    removeEmpresasFromSelector,
    replaceEmpresasInSelector,
  } = useAuth();
  const {
    preferencesReady,
    bootstrapStatus,
    bootstrapGeneration,
    error: preferencesSyncError,
    scheduleListagemSync,
  } = useEmpresasPreferencesBootstrapState();

  const resolveErrorMessage = (error, fallback) => {
    const apiMessage = error?.data?.message || error?.message;
    if (apiMessage && String(apiMessage).trim()) return String(apiMessage);
    return fallback;
  };

  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [] });
  const [showConfigColunas, setShowConfigColunas] = useState(false);
  const [showConfigFiltros, setShowConfigFiltros] = useState(false);
  const [showConfigPdf, setShowConfigPdf] = useState(false);
  const [showConfigExcel, setShowConfigExcel] = useState(false);
  const [historyOpen, setHistoryOpen] = useState(false);
  const { viewMode, setViewMode } = useEmpViewModePreference("table");
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
  const [tableFilteredEmpresas, setTableFilteredEmpresas] = useState(null);
  const [querySort, setQuerySort] = useState(readInitialQuerySort);
  const [queryPage, setQueryPage] = useState(1);
  const [queryPageSize, setQueryPageSize] = useState(EMP_INFINITE_PAGE_SIZE);
  const [loadBatchSize, setLoadBatchSize] = useState(() => readStoredEmpLoadBatchSize());
  const [appliedPanelFilters, setAppliedPanelFilters] = useState(undefined);
  const panelFiltersSyncedRef = useRef(false);
  const [columnFilters, setColumnFilters] = useState(readInitialColumnFiltersState);
  const [columnFiltersHydrated, setColumnFiltersHydrated] = useState(true);
  const columnFiltersRef = useRef(readInitialColumnFiltersState());
  const appliedFilterValuesRef = useRef({});
  const cardsVisFields = useEmpCardsVisFields();
  const { data: camposPersonalizados = [] } = useEmpCamposPersonalizados();
  const catalogFilterFields = useMemo(
    () => buildMgFilterFields(camposPersonalizados),
    [camposPersonalizados]
  );
  const {
    filterFields,
    layout: filterFieldsLayout,
    saveLayout: saveFilterFieldsLayout,
    getRestoreDefaults: getRestoreFilterFieldsLayout,
    catalogFields: filterFieldsCatalog,
  } = useEmpFilterFieldsLayout(catalogFilterFields);
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
    ? getFieldsPerRowForLayout(mobileCardsPerRow)
    : cardsVisFields.fieldsPerRow;
  const searchDropdownFields = useEmpSearchDropdownFields();
  const empFavorites = useEmpFavorites();
  const favoriteIds = useMemo(
    () => [...empFavorites.favorites],
    [empFavorites.favorites]
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
  const previousScopeEmpresaIdRef = useRef(selectedEmpresaId);
  const suppressColumnFilterPersistRef = useRef(true);
  const formBridgeSignatureRef = useRef("");
  const queryClient = useQueryClient();
  const saveCycle = useSaveCycle();

  useEffect(() => {
    if (previousScopeEmpresaIdRef.current === selectedEmpresaId) return;
    previousScopeEmpresaIdRef.current = selectedEmpresaId;
    suppressColumnFilterPersistRef.current = true;
    setShowForm(false);
    setEditingEmp(null);
    setViewMode("table");
    setSelectedTableItems([]);
    setSelectedIndex(0);
    setTableFilteredEmpresas(null);
    setSearchDraft("");
    setSearchTerm("");
    setPinnedRecord(null);
    setSearchFavoritesOnly(false);
    setDropdownSearch("");
  }, [selectedEmpresaId]);

  useEffect(() => {
    if (!preferencesReady || catalogFilterFields.length === 0) return;
    if (panelFiltersSyncedRef.current) return;
    if (isEmpPreferencesSectionDirty("view") || isEmpPreferencesSectionDirty("table")) return;

    const storedColumnFilters = readInitialColumnFiltersState();
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
    writeStoredTempListagemFilters(columnFilters || {});
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
    queryKey: ["emp-cadastro-dropdown", dropdownSearch, querySort.key, querySort.direction],
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
    queryKey: ["emp-cadastro-dropdown-fav", dropdownSearch, favoriteIdsKey, querySort.key, querySort.direction],
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
    setTableFilteredRecords: setTableFilteredEmpresas,
    setSelectedTableItems,
    setQueryPage,
    setSelectedIndex,
    setEditingRecord: setEditingEmp,
  });

  const {
    handleFilterChange,
    handleFilterClear,
    handleFilterApply,
    handleColumnFiltersChange,
  } = useMakListFilters({
    moduleId: empresasMakRuntime.moduleId,
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
    empresas,
    empresasPages,
    empresasResponseTotal,
    empresasLoading,
    empresasFetching,
    isLoading,
    isFetching,
    loadedPagesCount,
    canLoadMoreRows,
    loadedRowsLimitReached,
    maxLoadedRows,
    hasNextEmpresasPage,
    isFetchingNextEmpresasPage,
    handleLoadMoreEmpresas,
  } = useEmpresasInfiniteData({
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

  const totalEmpresas = pinnedRecord ? 1 : empresasResponseTotal || 0;
  const { data: metricsContadores } = useQuery({
    queryKey: ["metrics-contadores"],
    queryFn: () => MetricsApi.getContadores(),
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const empresasFiltradasPainel = useMemo(() => {
    if (pinnedRecord) return [pinnedRecord];
    return empresas;
  }, [empresas, pinnedRecord]);

  const recordNav = useServerRecordNavigation({
    items: empresasFiltradasPainel,
    total: totalEmpresas,
    page: queryPage,
    pageSize: queryPageSize,
    onPageChange: setQueryPage,
    pinnedRecord,
    disabled: !showForm || viewMode !== "record",
  });

  useEffect(() => {
    if (!showForm || viewMode !== "record" || pinnedRecord) return;
    if (!editingEmp?.id || editingEmp._isDuplicate) return;
    const record = recordNav.currentRecord;
    if (record?.id && record.id !== editingEmp.id) {
      setEditingEmp(record);
      setSelectedTableItems([record.id]);
      setSelectedIndex(recordNav.localIndex);
    }
  }, [
    recordNav.currentRecord?.id,
    recordNav.localIndex,
    showForm,
    viewMode,
    pinnedRecord,
    editingEmp?.id,
    editingEmp?._isDuplicate,
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
  }, [searchViewPending, pinnedRecord, isLoading, isFetching, empresasFiltradasPainel]);

  const handleFilteredEmpresasChange = useCallback((filtered) => {
    setTableFilteredEmpresas((previous) => {
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

  const empresasNavegacao = tableFilteredEmpresas ?? empresasFiltradasPainel;

  const refreshNavRecord = useCallback((list, record, navListOverride) => {
    const navList = navListOverride ?? tableFilteredEmpresas ?? list;
    const fresh = findEmpresaInList(list, record) ?? record;
    const navIndex = navList.findIndex(
      (item) => item.id === fresh.id || Number(item.codempresa) === Number(fresh.codempresa)
    );
    return { fresh, navList, navIndex };
  }, [searchTerm, tableFilteredEmpresas]);

  const currentEmp = empresasNavegacao[selectedIndex] || empresasNavegacao[0] || null;
  const selectedTableEmp = selectedTableItems.length === 1 ? empresasNavegacao.find((e) => e.id === selectedTableItems[0]) : null;
  const hasActiveFilters = Boolean(
    appliedPanelFilters ||
    Object.values(columnFilters).some((value) => isErpFilterActive(value)) ||
    Object.values(appliedFilterValues).some((value) => isErpFilterActive(value)) ||
    searchTerm.trim() ||
    searchFavoritesOnly
  );

  const stayOnRecordAfterSave = useCallback((savedRecord) => {
    const normalized = normalizeEmpresaRecord(savedRecord);
    const savedId = normalized?.id;

    if (!savedId) {
      setShowForm(true);
      setViewMode("record");
      return;
    }

    setReturnRecordAfterNew(null);
    setEditingEmp(normalized);
    setSelectedTableItems([savedId]);
    setShowForm(true);
    setViewMode("record");

    patchEmpresasCache(queryClient, (previous) => {
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

    const navList = tableFilteredEmpresas ?? empresasFiltradasPainel;
    const navIndex = navList.findIndex(
      (item) => item.id === savedId || Number(item.codempresa) === Number(normalized.codempresa)
    );
    if (navIndex >= 0) setSelectedIndex(navIndex);

    upsertEmpresaInSelector(normalized);
  }, [queryClient, tableFilteredEmpresas, empresasFiltradasPainel, upsertEmpresaInSelector]);

  const { handleSubmit } = useMakRecordSubmit({
    editingRecord: editingEmp,
    selectorSnapshot: empresasSelector,
    pendingAttachments,
    pendingCreatesRef,
    moduleRepository,
    moduleLabels: empresasMakRuntime.moduleLabels,
    schema: empresasMakRuntime.schema,
    normalizeRecord: empresasMakRuntime.normalizeRecord,
    listQueryKey: empresasMakRuntime.listQueryKey,
    patchListCache: empresasMakRuntime.patchListCache,
    entityName: empresasMakRuntime.entityName,
    metricsEntityKey: empresasMakRuntime.metricsEntityKey,
    queryClient,
    saveCycle,
    resolveErrorMessage,
    stayOnRecordAfterSave,
    setEditingRecord: setEditingEmp,
    setFormVersion,
    setSelectedTableItems,
    upsertInSelector: upsertEmpresaInSelector,
    removeFromSelector: removeEmpresasFromSelector,
    replaceInSelector: replaceEmpresasInSelector,
    setPendingAttachments,
    attachmentPersistErrorMessage: empresasMakRuntime.attachmentPersistErrorMessage,
  });

  const handleEdit = (emp) => {
    if (!saveCycle.guardAction()) return;
    closeFilterPanel();
    recordNav.syncLocalIndexFromRecord(emp);
    const index = empresasFiltradasPainel.findIndex((e) => e.id === emp.id);
    if (index >= 0) setSelectedIndex(index);
    setSelectedTableItems([emp.id]);
    setEditingEmp(emp);
    setShowForm(true);
    setViewMode("record");
  };

  const handleNew = () => {
    if (!saveCycle.guardAction()) return;
    closeFilterPanel();
    setReturnRecordAfterNew(showForm && viewMode === "record" ? editingEmp || currentEmp : null);
    setSelectedTableItems([]);
    const alreadyNew = showForm && !editingEmp?.id && !editingEmp?._isDuplicate;
    setEditingEmp(null);
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
    const { id, created_date, updated_date, created_by, codempresa, id_global, _isPersisting, ...dup } = emp;
    setEditingEmp({ ...dup, _isDuplicate: true });
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
      writeEmpPreferencesText(EMP_LOAD_BATCH_STORAGE_KEY, String(nextBatchSize), {
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
    setQueryPageSize(EMP_INFINITE_PAGE_SIZE);
    setQueryPage(1);
  }, []);

  const handleServerSortChange = useCallback((nextSort) => {
    setQuerySort((previous) => {
      const key = nextSort?.key || "codempresa";
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
        hasRecord: !!editingEmp?.id,
      }),
    [showForm, formBridge, selectedTableItems.length, editingEmp?.id]
  );

  const loadedRecordsCount = empresasFiltradasPainel.length;
  const filteredRecordsCount = Math.max(Number(totalEmpresas || 0), loadedRecordsCount);
  const totalRecordsCount = Math.max(
    Number(metricsContadores?.empresas || 0),
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
      setEditingEmp(null);
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
          const emp = selectedTableEmp || empresasNavegacao[selectedIndex] || empresasNavegacao[0];
          if (!emp) {
            handleNew();
            return;
          }
          handleEdit(emp);
        },
        onOpenTabela: () => {
          closeTransientDialogs();
          setShowForm(false);
          setEditingEmp(null);
          setSelectedTableItems([]);
          setViewMode("table");
        },
        onOpenCards: () => {
          closeTransientDialogs();
          if (!saveCycle.guardAction()) return;
          setShowForm(false);
          setEditingEmp(null);
          setSelectedTableItems([]);
          setViewMode("search");
        },
      });
    },
    [
      empresasNavegacao,
      closeTransientDialogs,
      handleEdit,
      handleNew,
      saveCycle,
      actionBarVisibility.secondaryToolsLocked,
      selectedIndex,
      selectedTableEmp,
      showForm,
      viewMode,
    ]
  );

  useEffect(() => {
    if (!preferencesReady) return undefined;
    const shouldSkipSync = (reason = "", detail = {}) => {
      const normalized = String(reason || "").toLowerCase();
      if (isRemoteTabPreferenceEvent(detail)) return true;
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
    const unsubscribe = subscribeEmpPreferencesCache((detail) => {
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
    if (!showForm || viewMode !== "record" || !editingEmp || editingEmp?._isDuplicate) return;
    if (empresasNavegacao.length === 0) return;

    const currentFilteredIndex = editingEmp.id
      ? empresasNavegacao.findIndex((item) => item.id === editingEmp.id)
      : -1;

    if (currentFilteredIndex >= 0) {
      if (selectedIndex !== currentFilteredIndex) setSelectedIndex(currentFilteredIndex);
      const fresh = empresasNavegacao[currentFilteredIndex];
      if (fresh?.id === editingEmp.id && fresh.updatedAt !== editingEmp.updatedAt) {
        setEditingEmp(fresh);
      }
      return;
    }

    const stillExists = empresas.some((item) => item.id === editingEmp.id);
    if (!stillExists && empresasNavegacao.length > 0) {
      const fallbackIndex = Math.min(Math.max(selectedIndex, 0), empresasNavegacao.length - 1);
      const fallbackEmp = empresasNavegacao[fallbackIndex];
      if (fallbackEmp) {
        setEditingEmp(fallbackEmp);
        setSelectedIndex(fallbackIndex);
        setSelectedTableItems([fallbackEmp.id]);
      }
    }
  }, [showForm, viewMode, empresasNavegacao, empresas, editingEmp?.id, editingEmp?.updatedAt, editingEmp?._isDuplicate, selectedIndex]);

  const handleTableSelectionChange = useCallback((ids) => {
    setSelectedTableItems((p) => { const same = p.length === ids.length && p.every((id, i) => id === ids[i]); return same ? p : ids; });
    if (ids.length === 1) {
      const i = empresasNavegacao.findIndex((e) => e.id === ids[0]);
      if (i >= 0) {
        setSelectedIndex(i);
      }
    }
  }, [empresasNavegacao]);

  const handleToggleSearchView = useCallback(() => {
    if (!saveCycle.guardAction()) return;
    if (viewMode === "search") {
      handleOpenTableView();
      return;
    }
    closeTransientDialogs();
    setShowForm(false);
    setEditingEmp(null);
    setViewMode("search");
  }, [closeTransientDialogs, handleOpenTableView, saveCycle, viewMode]);

  const handleToggleView = () => {
    if (!saveCycle.guardAction()) return;
    if (viewMode === "search") {
      if (selectedTableItems.length > 1) return;
      closeTransientDialogs();
      const emp = selectedTableEmp || empresasNavegacao[selectedIndex] || empresasNavegacao[0];
      if (!emp) return;
      const index = empresasNavegacao.findIndex((e) => e.id === emp.id);
      if (index >= 0) setSelectedIndex(index);
      setEditingEmp(emp);
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
    const emp = selectedTableEmp || empresasNavegacao[selectedIndex] || empresasNavegacao[0];
    if (!emp) return;
    const index = empresasNavegacao.findIndex((e) => e.id === emp.id);
    if (index >= 0) setSelectedIndex(index);
    setEditingEmp(emp);
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
    moduleLabels: empresasMakRuntime.moduleLabels,
    listQueryKey: empresasMakRuntime.listQueryKey,
    patchListCache: empresasMakRuntime.patchListCache,
    metricsEntityKey: empresasMakRuntime.metricsEntityKey,
    queryClient,
    saveCycle,
    resolveErrorMessage,
    showForm,
    viewMode,
    editingRecord: editingEmp,
    selectorState: empresasSelector,
    navigationList: empresasNavegacao,
    attachmentsRecord,
    selectedTableItems,
    findRecordInList: empresasMakRuntime.findRecordInList,
    refreshNavRecord,
    removeFromSelector: removeEmpresasFromSelector,
    replaceInSelector: replaceEmpresasInSelector,
    setShowForm,
    setEditingRecord: setEditingEmp,
    setViewMode,
    setSelectedTableItems,
    setSelectedIndex,
    setFormVersion,
    setAttachmentsRecord,
    setAttachmentsOpen,
  });

  const { exportBusy, exportMessage, handleExportPdf, handleExportExcel } = useMakRecordExport({
    moduleRepository,
    moduleLabels: empresasMakRuntime.moduleLabels,
    saveCycle,
    resolveErrorMessage,
    searchTerm,
    querySort,
    listFilters,
    selectedTableItems,
    pinnedRecord,
    visibleTableData,
    getPdfExportConfig: empresasMakRuntime.getPdfExportConfig,
    buildExportRows: empresasMakRuntime.buildExportRows,
  });

  const handlePrint = useCallback(() => {
    const printTitle = `${moduleLabels.title} - ${new Date().toLocaleDateString("pt-BR")}`;
    const singleRecord =
      showForm && editingEmp
        ? editingEmp
        : pinnedRecord || (selectedTableItems.length === 1 ? selectedTableEmp : null);

    if (singleRecord) {
      const config = getEmpPdfExportConfig();
      const srcCols = config.useConfiguredColumns
        ? visibleTableData.allColumns || visibleTableData.columns
        : visibleTableData.columns;
      const selCols =
        config.useConfiguredColumns && config.columnIds.length
          ? srcCols.filter((c) => config.columnIds.includes(c.id))
          : srcCols;
      const rows = buildEmpresaExportRows([singleRecord], selCols);
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
    editingEmp,
    pinnedRecord,
    selectedTableEmp,
    selectedTableItems.length,
    showForm,
    visibleTableData,
  ]);

  const handleOpenHistory = useCallback(() => {
    if (showForm && editingEmp?.id) {
      setHistoryOpen(true);
      return;
    }
    if (selectedTableItems.length === 1 && selectedTableEmp) {
      setHistoryOpen(true);
      return;
    }
    setHistoryOpen(true);
  }, [editingEmp?.id, selectedTableEmp, selectedTableItems.length, showForm]);

  const formCancel = () => {
    if (editingEmp && !editingEmp._isDuplicate) {
      setFormVersion((p) => p + 1);
      setViewMode("record");
      return;
    }
    if ((editingEmp?._isDuplicate || !editingEmp) && returnRecordAfterNew) {
      setEditingEmp(returnRecordAfterNew);
      setShowForm(true);
      setViewMode("record");
      setReturnRecordAfterNew(null);
      return;
    }
    setShowForm(false);
    setEditingEmp(null);
    setViewMode("table");
    setSelectedTableItems([]);
    setReturnRecordAfterNew(null);
  };

  const recordCode = formBridge?.recordMeta?.codigo
    ? String(formBridge.recordMeta.codigo).padStart(6, "0")
    : editingEmp?.codempresa
      ? String(editingEmp.codempresa).padStart(6, "0")
      : "";
  const recordTitle =
    formBridge?.recordMeta?.nome ||
    (showForm && !editingEmp?.id && !editingEmp?._isDuplicate
      ? "Nova Empresa"
      : editingEmp?._isDuplicate
        ? "Duplicar empresa"
        : null) ||
    editingEmp?.razao_social ||
    editingEmp?.nome_empresa ||
    "Novo registro";

  const filterControlsDisabled = saveCycle.isSaving || actionBarVisibility.secondaryToolsLocked;
  const preferencesDegraded =
    bootstrapStatus === "fallback_local" || Boolean(preferencesSyncError?.message);

  return (
    <div className="cadastro-emp-scope mg-empresas-scope flex h-full min-h-0 flex-1 flex-col overflow-hidden">
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
            isFavoriteRecord={empFavorites.isFavorite}
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
                  : () => selectedTableEmp && handleEdit(selectedTableEmp)
                : undefined
            }
            onDelete={
              makPermissions.canDelete
                ? showForm
                  ? () => editingEmp?.id && handleRequestDelete(editingEmp.id)
                  : () => selectedTableItems.length > 0 && handleRequestDelete(selectedTableItems)
                : undefined
            }
            onDuplicate={
              makPermissions.canEdit
                ? showForm
                  ? () => editingEmp && handleDuplicate(editingEmp)
                  : () => selectedTableEmp && handleDuplicate(selectedTableEmp)
                : undefined
            }
            onAttach={() => {
              if (showForm) {
                setAttachmentsOpen(true);
                return;
              }
              if (selectedTableEmp) {
                setAttachmentsRecord(selectedTableEmp);
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
                recordId={editingEmp?.id ?? null}
                isFavorite={editingEmp?.id ? empFavorites.isFavorite(editingEmp.id) : false}
                onToggleFavorite={() => {
                  if (editingEmp?.id) empFavorites.toggleFavorite(editingEmp.id);
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
                empresas={empresasFiltradasPainel}
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
                empresas={empresasFiltradasPainel}
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
                <EmpresasFormPanel
                  formProps={{
                    initialData: editingEmp,
                    recordKey: editingEmp?.id ?? (editingEmp?._isDuplicate ? "duplicate" : "new"),
                    resetSeed: formVersion,
                    isEditing: !!editingEmp,
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
                    onDelete: () => editingEmp?.id && handleRequestDelete(editingEmp.id),
                    onDuplicate: () => editingEmp && handleDuplicate(editingEmp),
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
                    <EmpresasSearchPanel
                      searchProps={{
                        empresas: empresasFiltradasPainel,
                        total: totalEmpresas,
                        isLoading: empresasLoading,
                        isFetching: empresasFetching,
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
                        isFavoriteRecord: empFavorites.isFavorite,
                        onToggleFavorite: empFavorites.toggleFavorite,
                        mgPrototype: true,
                        infiniteMode: true,
                        hasMoreRows: hasNextEmpresasPage && canLoadMoreRows,
                        onLoadMoreRows: handleLoadMoreEmpresas,
                        isLoadingMoreRows: isFetchingNextEmpresasPage,
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
                  <EmpresasTablePanel
                    tableProps={{
                      key: "tbl-emp",
                      empresas: empresasFiltradasPainel,
                      isLoadingEmpresas: empresasLoading,
                      isFetchingEmpresas: empresasFetching,
                      onEdit: handleEdit,
                      showConfigColunas,
                      setShowConfigColunas,
                      searchTerm: "",
                      selectedRecordId: undefined,
                      selectedIds: selectedTableItems,
                      onSelectionChange: handleTableSelectionChange,
                      onVisibleDataChange: setVisibleTableData,
                      onFilteredEmpresasChange: handleFilteredEmpresasChange,
                      onServerColumnFiltersChange: handleColumnFiltersChange,
                      externalColumnFilters: columnFiltersHydrated ? columnFilters : undefined,
                      serverPage: queryPage,
                      serverPageSize: queryPageSize,
                      serverTotal: totalEmpresas,
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
                      hasMoreRows: hasNextEmpresasPage && canLoadMoreRows,
                      onLoadMoreRows: handleLoadMoreEmpresas,
                      isLoadingMoreRows: isFetchingNextEmpresasPage,
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

      <EmpConfiguracaoFiltrosDialog
        open={showConfigFiltros}
        onOpenChange={setShowConfigFiltros}
        moduleTitle={moduleLabels.title}
        camposDisponiveis={filterFieldsConfigCatalog}
        camposVisiveis={filterFieldsLayout.visiveis}
        camposOrdem={filterFieldsLayout.ordem}
        onChange={saveFilterFieldsLayout}
        getRestoreDefaults={getRestoreFilterFieldsLayout}
      />

      <EmpresasDialogs
        exportPdfProps={{
          open: showConfigPdf,
          onOpenChange: setShowConfigPdf,
          columns: visibleTableData.allColumns || visibleTableData.columns || [],
          initialConfig: getEmpPdfExportConfig(),
          tipo: "pdf",
          onSaveConfig: (config) => saveEmpPdfExportConfig(config),
        }}
        exportExcelProps={{
          open: showConfigExcel,
          onOpenChange: setShowConfigExcel,
          columns: visibleTableData.allColumns || visibleTableData.columns || [],
          initialConfig: getEmpExcelExportConfig(),
          tipo: "excel",
          onSaveConfig: (config) => saveEmpExcelExportConfig(config),
        }}
        anexosProps={{
          open: attachmentsOpen,
          onOpenChange: (open) => {
            setAttachmentsOpen(open);
            if (!open && !showForm) setAttachmentsRecord(null);
          },
          entityName: empresasModuleDefinition.entityName,
          recordId:
            showForm && editingEmp?.id && !isPendingRecordId(editingEmp.id)
              ? editingEmp.id
              : !showForm
                ? attachmentsRecord?.id
                : undefined,
          title:
            (showForm
              ? editingEmp?.razao_social || editingEmp?.codempresa
              : attachmentsRecord?.razao_social || attachmentsRecord?.codempresa) ||
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
      <MakMasterHistory
        open={historyOpen}
        onOpenChange={setHistoryOpen}
        moduleLabel={moduleLabels.singular}
        recordCode={recordCode || null}
        recordTitle={recordTitle || null}
      />
    </div>
  );
}