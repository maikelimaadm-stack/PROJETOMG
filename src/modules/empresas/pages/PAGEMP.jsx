import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useInfiniteQuery, useQuery, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/shared/feedback";
import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { findEmpresaInList, normalizeEmpresaRecord } from "@/modules/empresas/utils/empCodigoUtils";
import { useAuth } from "@/shared/contexts/AuthContext";
import { printCadastroTable } from "@/framework/cadastro/exports/tableExportUtils";
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
import MgActionBar from "@/modules/empresas/layout/MgActionBar";
import MgCardsPanelStrip from "@/modules/empresas/layout/MgCardsPanelStrip";
import MgTablePanelStrip from "@/modules/empresas/layout/MgTablePanelStrip";
import MgFilterPanel from "@/modules/empresas/layout/MgFilterPanel";
import MgContextPanel from "@/modules/empresas/layout/MgContextPanel";
import MgMobileViewBar from "@/modules/empresas/layout/MgMobileViewBar";
import { useMgEmpresasChrome } from "@/modules/empresas/layout/MgEmpresasChromeContext";
import { applyMgViewMode, resolveMgViewMode } from "@/modules/empresas/layout/mgViewMode";
import { resolveMgActionBarVisibility } from "@/modules/empresas/layout/mgActionBarRules";
import { useEmpCardsVisFields } from "@/modules/empresas/hooks/useEmpCardsVisFields";
import { getFieldsPerRowForLayout } from "@/modules/empresas/components/empSearchView.constants";
import { useEmpSearchDropdownFields } from "@/modules/empresas/hooks/useEmpSearchDropdownFields";
import { useEmpFavorites } from "@/modules/empresas/hooks/useEmpFavorites";
import {
  EMP_INFINITE_MAX_ROWS,
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
  buildEmpresaColumnFilters,
  buildEmpresaPanelFilters,
  mergeEmpresaListFilters,
} from "@/shared/listing/buildEmpresaListFilters";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";
import { buildEmpresaExportRows } from "@/modules/empresas/utils/empExportRows";
import { patchMetricsCache, setMetricsCache } from "@/apis/metrics/metricsCache";
import { MetricsApi } from "@/apis/metrics/MetricsApi";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import { isPendingRecordId } from "@/shared/utils/pendingRecordUtils";
import { useSaveCycle } from "@/shared/hooks/useSaveCycle";
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import {
  buildMgFilterFields,
  buildPanelFilterColumnMap,
} from "@/modules/empresas/layout/mgFilterFields";

const DROPDOWN_PAGE_SIZE = 30;

const moduleRepository = empresasModuleDefinition.repository;
const moduleLabels = {
  singular: empresasModuleDefinition.singularLabel,
  plural: empresasModuleDefinition.pluralLabel,
  title: `Cadastro de ${empresasModuleDefinition.pluralLabel}`,
};

const normalizeFilterList = (value) => {
  if (Array.isArray(value)) {
    return value.map((item) => String(item).trim()).filter(Boolean);
  }
  if (value && typeof value === "object") {
    if (Array.isArray(value.values)) {
      return value.values.map((item) => String(item).trim()).filter(Boolean);
    }
    if (value.value != null && String(value.value).trim() !== "") {
      return [String(value.value).trim()];
    }
    return [];
  }
  if (value == null || String(value).trim() === "") return [];
  return [String(value).trim()];
};

const syncPanelFiltersIntoColumns = (
  panelValues = {},
  baseColumnFilters = {},
  panelFilterColumnMap = {}
) => {
  const next = { ...(baseColumnFilters || {}) };
  Object.values(panelFilterColumnMap).forEach((columnKey) => {
    delete next[columnKey];
  });

  Object.entries(panelFilterColumnMap).forEach(([panelKey, columnKey]) => {
    const values = normalizeFilterList(panelValues?.[panelKey]);
    if (values.length > 0) {
      next[columnKey] = { values: [...new Set(values)] };
    }
  });

  return next;
};

const syncColumnsIntoPanelFilters = (columnFilters = {}, panelFilterColumnMap = {}) =>
  Object.entries(panelFilterColumnMap).reduce((acc, [panelKey, columnKey]) => {
    acc[panelKey] = normalizeFilterList(columnFilters?.[columnKey]);
    return acc;
  }, {});

const patchEmpresasCache = (queryClient, updater) => {
  queryClient.setQueriesData({ queryKey: ["emp-cadastro"] }, (previous) => {
    if (previous?.items) {
      return updater(previous);
    }

    if (!Array.isArray(previous?.pages)) {
      return previous;
    }

    const pageSize =
      Number(previous.pages[0]?.pageSize) || EMP_INFINITE_PAGE_SIZE;
    const mergedItems = previous.pages.flatMap((page) => page?.items || []);
    const mergedTotal = Number(previous.pages[0]?.total ?? mergedItems.length);
    const nextMerged = updater({
      items: mergedItems,
      total: mergedTotal,
      page: 1,
      pageSize,
      totalPages: Math.max(1, Math.ceil(mergedTotal / pageSize)),
    });

    if (!nextMerged?.items) return previous;

    const loadedPages = Math.max(previous.pages.length, 1);
    const maxLoadedItems = loadedPages * pageSize;
    const slicedItems = nextMerged.items.slice(0, maxLoadedItems);
    const total = Number(nextMerged.total ?? slicedItems.length);
    const totalPages = Math.max(1, Math.ceil(total / pageSize));
    const nextPages = Array.from({ length: loadedPages }, (_, index) => {
      const start = index * pageSize;
      const end = start + pageSize;
      const basePage = previous.pages[index] || {};
      return {
        ...basePage,
        items: slicedItems.slice(start, end),
        page: index + 1,
        pageSize,
        total,
        totalPages,
      };
    });
    const existingParams = Array.isArray(previous.pageParams)
      ? previous.pageParams.slice(0, loadedPages)
      : [];
    const pageParams =
      existingParams.length === loadedPages
        ? existingParams
        : Array.from({ length: loadedPages }, (_, index) => index + 1);

    return {
      ...previous,
      pages: nextPages,
      pageParams,
    };
  });
};

export default function PAGEMP() {
  const {
    empresas: empresasSelector,
    selectedEmpresaId,
    upsertEmpresaInSelector,
    removeEmpresasFromSelector,
    replaceEmpresasInSelector,
  } = useAuth();

  const resolveErrorMessage = (error, fallback) => {
    const apiMessage = error?.data?.message || error?.message;
    if (apiMessage && String(apiMessage).trim()) return String(apiMessage);
    return fallback;
  };

  const [showForm, setShowForm] = useState(false);
  const [editingEmp, setEditingEmp] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [] });
  const [showConfigColunas, setShowConfigColunas] = useState(false);
  const [showConfigPdf, setShowConfigPdf] = useState(false);
  const [showConfigExcel, setShowConfigExcel] = useState(false);
  const [viewMode, setViewMode] = useState("table");
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
  const [querySort, setQuerySort] = useState({ key: "codempresa", direction: "asc" });
  const [queryPage, setQueryPage] = useState(1);
  const [queryPageSize, setQueryPageSize] = useState(EMP_INFINITE_PAGE_SIZE);
  const [loadBatchSize, setLoadBatchSize] = useState(() => readStoredEmpLoadBatchSize());
  const [appliedPanelFilters, setAppliedPanelFilters] = useState(undefined);
  const [columnFilters, setColumnFilters] = useState({});
  const [columnFiltersHydrated, setColumnFiltersHydrated] = useState(false);
  const cardsVisFields = useEmpCardsVisFields();
  const { data: camposPersonalizados = [] } = useEmpCamposPersonalizados();
  const filterFields = useMemo(
    () => buildMgFilterFields(camposPersonalizados),
    [camposPersonalizados]
  );
  const panelFilterColumnMap = useMemo(
    () => buildPanelFilterColumnMap(filterFields),
    [filterFields]
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
  } = useMgEmpresasChrome();
  const [filterValues, setFilterValues] = useState({});
  const [appliedFilterValues, setAppliedFilterValues] = useState({});
  const [formBridge, setFormBridge] = useState(null);
  const pendingDeleteIdsRef = useRef([]);
  const pendingCreatesRef = useRef(new Map());
  const previousScopeEmpresaIdRef = useRef(selectedEmpresaId);
  const queryClient = useQueryClient();
  const saveCycle = useSaveCycle();

  useEffect(() => {
    if (previousScopeEmpresaIdRef.current === selectedEmpresaId) return;
    previousScopeEmpresaIdRef.current = selectedEmpresaId;
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
    if (!showForm) {
      setPendingAttachments([]);
      setAttachmentsOpen(false);
    }
  }, [showForm]);

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
      mergeEmpresaListFilters(
        appliedPanelFilters,
        searchFavoritesOnly ? { ids: favoriteIds } : undefined
      ),
    [appliedPanelFilters, searchFavoritesOnly, favoriteIds]
  );

  const listFilters = useMemo(
    () =>
      mergeEmpresaListFilters(
        appliedPanelFilters,
        buildEmpresaColumnFilters(columnFilters),
        searchFavoritesOnly ? { ids: favoriteIds } : undefined
      ),
    [appliedPanelFilters, columnFilters, searchFavoritesOnly, favoriteIds]
  );

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
    Object.values(columnFilters).some((value) => {
      if (!value) return false;
      if (Array.isArray(value)) return value.length > 0;
      if (typeof value !== "object") return false;
      const hasValues = Array.isArray(value.values) && value.values.length > 0;
      const hasPrimary = value.value !== null && value.value !== undefined && String(value.value).trim() !== "";
      const hasSecondary = value.valueTo !== null && value.valueTo !== undefined && String(value.valueTo).trim() !== "";
      return hasValues || hasPrimary || hasSecondary;
    }) ||
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

  const persistPendingAttachments = useCallback(async (recordId, items) => {
    if (!recordId || !items?.length) return;

    await Promise.all(
      items.map((anexo) =>
        AnexosApi.create({
          entity_name: anexo.entity_name || empresasModuleDefinition.entityName,
          record_id: recordId,
          empresa_id: recordId,
          attachment_name: anexo.attachment_name,
          file_name: anexo.file_name,
          file_url: anexo.file_url,
          storage_path: anexo.storage_path,
          file_type: anexo.file_type,
          file_size: anexo.file_size,
        })
      )
    );
  }, []);

  const handleSubmit = useCallback((data) => {
    if (saveCycle.isSaving) return;

    const isUpdate = Boolean(
      editingEmp?.id && !isPendingRecordId(editingEmp.id) && !editingEmp._isDuplicate
    );

    try {
      const validatedData = empresasModuleDefinition.schema.parse(data);
      saveCycle.beginSave();

      if (isUpdate) {
        const optimistic = normalizeEmpresaRecord({ ...editingEmp, ...validatedData });
        const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["emp-cadastro"] });
        const selectorSnapshot = empresasSelector;

        patchEmpresasCache(queryClient, (previous) => ({
          ...previous,
          items: previous.items.map((item) =>
            item.id === editingEmp.id ? { ...item, ...optimistic } : item
          ),
        }));
        upsertEmpresaInSelector(optimistic);
        setEditingEmp(optimistic);
        stayOnRecordAfterSave(optimistic);
        setFormVersion((version) => version + 1);

        void moduleRepository
          .update(editingEmp.id, validatedData)
          .then((savedRecord) => {
            const normalized = normalizeEmpresaRecord(savedRecord);
            patchEmpresasCache(queryClient, (previous) => ({
              ...previous,
              items: previous.items.map((item) =>
                item.id === editingEmp.id ? { ...item, ...normalized } : item
              ),
            }));
            setEditingEmp(normalized);
            upsertEmpresaInSelector(normalized);
            showSuccess(`${moduleLabels.singular} atualizada!`);
          })
          .catch((error) => {
            cacheSnapshot.forEach(([key, value]) => {
              queryClient.setQueryData(key, value);
            });
            replaceEmpresasInSelector(selectorSnapshot);
            showError(
              resolveErrorMessage(
                error,
                `Não foi possível atualizar a ${moduleLabels.singular.toLowerCase()}.`
              )
            );
          })
          .finally(() => {
            saveCycle.end();
          });
        return;
      }

      const { _isDuplicate, ...clean } = validatedData;
      const pendingId = `pending-${crypto.randomUUID()}`;
      const optimistic = normalizeEmpresaRecord({
        ...clean,
        id: pendingId,
        _isPersisting: true,
      });
      const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["emp-cadastro"] });
      const createEntry = { cancelled: false };
      pendingCreatesRef.current.set(pendingId, createEntry);

      patchEmpresasCache(queryClient, (previous) => ({
        ...previous,
        items: [optimistic, ...previous.items],
        total: previous.total + 1,
      }));
      patchMetricsCache(queryClient, { empresas: 1, registrosGlobais: 1 });
      stayOnRecordAfterSave(optimistic);
      setFormVersion((version) => version + 1);

      void moduleRepository
        .create(clean)
        .then(async (response) => {
          const normalized = normalizeEmpresaRecord(response?.item);
          pendingCreatesRef.current.delete(pendingId);

          if (createEntry.cancelled) {
            try {
              const deleteResponse = await moduleRepository.delete(normalized.id);
              if (deleteResponse?.contadores) {
                setMetricsCache(queryClient, deleteResponse.contadores);
              }
            } catch {
              // UI já removeu; servidor pode ter excluído ou falhado silenciosamente
            }
            return;
          }

          patchEmpresasCache(queryClient, (previous) => ({
            ...previous,
            items: previous.items.map((item) =>
              item.id === pendingId ? normalized : item
            ),
          }));
          setEditingEmp((current) =>
            current?.id === pendingId ? normalized : current
          );
          setSelectedTableItems((current) =>
            current.includes(pendingId) ? [normalized.id] : current
          );
          upsertEmpresaInSelector(normalized);
          if (pendingAttachments.length > 0) {
            try {
              await persistPendingAttachments(normalized.id, pendingAttachments);
              setPendingAttachments([]);
            } catch {
              showError("Empresa cadastrada, mas alguns anexos não puderam ser salvos.");
            }
          }
          setMetricsCache(queryClient, response?.contadores);
          showSuccess(`${moduleLabels.singular} cadastrada!`);
        })
        .catch((error) => {
          pendingCreatesRef.current.delete(pendingId);
          if (!createEntry.cancelled) {
            patchMetricsCache(queryClient, { empresas: -1, registrosGlobais: -1 });
            cacheSnapshot.forEach(([key, value]) => {
              queryClient.setQueryData(key, value);
            });
            patchEmpresasCache(queryClient, (previous) => ({
              ...previous,
              items: previous.items.filter((item) => item.id !== pendingId),
              total: Math.max(0, previous.total - 1),
            }));
            removeEmpresasFromSelector([pendingId]);
          }
          showError(
            resolveErrorMessage(
              error,
              `Não foi possível cadastrar a ${moduleLabels.singular.toLowerCase()}.`
            )
          );
        })
        .finally(() => {
          saveCycle.end();
        });
    } catch (error) {
      saveCycle.end();
      showError(
        resolveErrorMessage(
          error,
          isUpdate
            ? `Não foi possível atualizar a ${moduleLabels.singular.toLowerCase()}.`
            : `Não foi possível cadastrar a ${moduleLabels.singular.toLowerCase()}.`
        )
      );
    }
  }, [
    editingEmp,
    empresasSelector,
    pendingAttachments,
    persistPendingAttachments,
    queryClient,
    removeEmpresasFromSelector,
    replaceEmpresasInSelector,
    saveCycle,
    stayOnRecordAfterSave,
    upsertEmpresaInSelector,
  ]);

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

  const handleSearchInputChange = useCallback((value) => {
    setSearchDraft(value);
    if (!String(value || "").trim()) {
      setPinnedRecord(null);
    }
  }, []);

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
  }, []);

  const handleSearchCommit = useCallback((value) => {
    const next = String(value || "").trim();
    setPinnedRecord(null);
    setSearchTerm(next);
    setQueryPage(1);
    setTableFilteredEmpresas(null);
    setSelectedTableItems([]);
  }, []);

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
  }, [searchDraft]);

  const handleSearchApplyFavorites = useCallback(() => {
    searchViewApplyRef.current = "all";
    setSearchViewPending(true);
    setSearchFavoritesOnly(true);
    setPinnedRecord(null);
    setSearchTerm(normalizeSearchQuery(searchDraft));
    setTableFilteredEmpresas(null);
    setSelectedTableItems([]);
  }, [searchDraft]);

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
    [searchDraft, showForm, viewMode]
  );

  const handleFilterChange = useCallback((key, value) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const handleFilterClear = useCallback(() => {
    setFilterValues({});
    setAppliedFilterValues({});
    setAppliedPanelFilters(undefined);
    setColumnFiltersHydrated(true);
    setColumnFilters((prev) => syncPanelFiltersIntoColumns({}, prev, panelFilterColumnMap));
    setSearchDraft("");
    setSearchTerm("");
    setPinnedRecord(null);
    setSearchFavoritesOnly(false);
    setDropdownSearch("");
    setQueryPage(1);
  }, [panelFilterColumnMap]);

  const handleFilterApply = useCallback(
    (snapshot) => {
      const nextValues = snapshot ?? filterValues;
      if (snapshot) {
        setFilterValues(snapshot);
      }
      setAppliedFilterValues({ ...nextValues });
      setAppliedPanelFilters(buildEmpresaPanelFilters(nextValues));
      setColumnFiltersHydrated(true);
      setColumnFilters((prev) => syncPanelFiltersIntoColumns(nextValues, prev, panelFilterColumnMap));
      setQueryPage(1);
      closeFilterPanel();
    },
    [closeFilterPanel, filterValues, panelFilterColumnMap]
  );

  const handleColumnFiltersChange = useCallback((nextColumnFilters) => {
    const safeNext = nextColumnFilters || {};
    const syncedPanelValues = syncColumnsIntoPanelFilters(safeNext, panelFilterColumnMap);
    setColumnFiltersHydrated(true);
    setColumnFilters(safeNext);
    setFilterValues((prev) => ({ ...prev, ...syncedPanelValues }));
    setAppliedFilterValues((prev) => ({ ...prev, ...syncedPanelValues }));
    setAppliedPanelFilters(buildEmpresaPanelFilters(syncedPanelValues));
    setQueryPage(1);
  }, [panelFilterColumnMap]);

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
    if (typeof window !== "undefined") {
      window.localStorage.setItem(EMP_LOAD_BATCH_STORAGE_KEY, String(nextBatchSize));
    }
  }, []);

  const handleServerPageSizeChange = useCallback(() => {
    setQueryPageSize(EMP_INFINITE_PAGE_SIZE);
    setQueryPage(1);
  }, []);

  const mgViewMode = resolveMgViewMode({ showForm, viewMode });
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
    if (!showForm) setFormBridge(null);
  }, [showForm]);

  useEffect(() => {
    if (showForm && formBridge?.layoutConfigOpen) {
      setBreadcrumbSuffix("Configuração de layout");
      return () => setBreadcrumbSuffix(null);
    }
    setBreadcrumbSuffix(null);
    return undefined;
  }, [showForm, formBridge?.layoutConfigOpen, setBreadcrumbSuffix]);

  const handleOpenTableView = useCallback(() => {
    if (showForm) {
      setShowForm(false);
      setEditingEmp(null);
      setSelectedTableItems([]);
    }
    setViewMode("table");
  }, [showForm]);

  const handleMgViewModeChange = useCallback(
    (mode) => {
      if (saveCycle.isSaving || actionBarVisibility.secondaryToolsLocked) return;
      applyMgViewMode(mode, {
        onOpenRegistro: () => {
          if (showForm && viewMode === "record") return;
          const emp = selectedTableEmp || empresasNavegacao[selectedIndex] || empresasNavegacao[0];
          if (!emp) {
            handleNew();
            return;
          }
          handleEdit(emp);
        },
        onOpenTabela: () => {
          setShowForm(false);
          setEditingEmp(null);
          setSelectedTableItems([]);
          setViewMode("table");
        },
        onOpenCards: () => {
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
    setShowForm(false);
    setEditingEmp(null);
    setViewMode("search");
  }, [handleOpenTableView, saveCycle, viewMode]);

  const handleToggleView = () => {
    if (!saveCycle.guardAction()) return;
    if (viewMode === "search") {
      if (selectedTableItems.length > 1) return;
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

  const handleConfirmDelete = async () => {
    const ids = pendingDeleteIdsRef.current.length > 0 ? pendingDeleteIdsRef.current : deleteState.ids;
    if (ids.length === 0) {
      showError("Nenhum registro selecionado para exclusão.");
      throw new Error("Nenhum registro selecionado para exclusão.");
    }

    saveCycle.beginDelete();

    const wasOnForm = showForm && viewMode === "record";
    const deletedCurrentFromForm = wasOnForm && editingEmp?.id && ids.includes(editingEmp.id);
    const navListBeforeDelete = empresasNavegacao;
    const navIndexBeforeDelete = deletedCurrentFromForm
      ? navListBeforeDelete.findIndex((item) => item.id === editingEmp.id)
      : -1;

    const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["emp-cadastro"] });
    const metricsSnapshot = queryClient.getQueryData(["metrics-contadores"]);
    const selectorSnapshot = empresasSelector;

    patchEmpresasCache(queryClient, (previous) => ({
      ...previous,
      items: previous.items.filter((item) => !ids.includes(item.id)),
      total: Math.max(0, previous.total - ids.length),
    }));
    patchMetricsCache(queryClient, { empresas: -ids.length });
    removeEmpresasFromSelector(ids);

    const list = navListBeforeDelete.filter((item) => !ids.includes(item.id));

    if (attachmentsRecord?.id && ids.includes(attachmentsRecord.id)) {
      setAttachmentsRecord(null);
      setAttachmentsOpen(false);
    }

    if (deletedCurrentFromForm) {
      const remainingNav = navListBeforeDelete
        .filter((item) => !ids.includes(item.id))
        .map((item) => findEmpresaInList(list, item))
        .filter(Boolean);

      if (remainingNav.length === 0) {
        setShowForm(false);
        setEditingEmp(null);
        setViewMode("table");
        setSelectedTableItems([]);
        setSelectedIndex(0);
      } else {
        const nextIndex = Math.min(Math.max(navIndexBeforeDelete, 0), remainingNav.length - 1);
        const nextEmp = remainingNav[nextIndex];
        setEditingEmp(nextEmp);
        setSelectedIndex(nextIndex);
        setSelectedTableItems([nextEmp.id]);
        setShowForm(true);
        setViewMode("record");
      }
    } else {
      const remainingNav = navListBeforeDelete
        .filter((item) => !ids.includes(item.id))
        .map((item) => findEmpresaInList(list, item))
        .filter(Boolean);

      setSelectedTableItems((prev) => prev.filter((id) => !ids.includes(id)));

      if (showForm && viewMode === "record" && editingEmp?.id && !ids.includes(editingEmp.id)) {
        const { fresh, navIndex } = refreshNavRecord(list, editingEmp, remainingNav);
        if (fresh) {
          setEditingEmp(fresh);
          if (navIndex >= 0) setSelectedIndex(navIndex);
        }
      } else if (remainingNav.length === 0) {
        setSelectedIndex(0);
      } else if (selectedTableItems.some((id) => ids.includes(id))) {
        const nextIndex = Math.min(
          Math.max(navListBeforeDelete.findIndex((item) => ids.includes(item.id)), 0),
          remainingNav.length - 1
        );
        setSelectedIndex(nextIndex);
        if (remainingNav[nextIndex]?.id) setSelectedTableItems([remainingNav[nextIndex].id]);
      } else {
        setSelectedIndex((prev) => Math.min(prev, remainingNav.length - 1));
      }

      if (wasOnForm && viewMode === "record" && !editingEmp?.id && !editingEmp?._isDuplicate) {
        setFormVersion((version) => version + 1);
      }
    }

    pendingDeleteIdsRef.current = [];
    setDeleteState({ open: false, ids: [] });

    const pendingIds = ids.filter((id) => isPendingRecordId(id));
    const persistedIds = ids.filter((id) => !isPendingRecordId(id));

    pendingIds.forEach((pendingId) => {
      const entry = pendingCreatesRef.current.get(pendingId);
      if (entry) entry.cancelled = true;
    });

    try {
      if (persistedIds.length === 0) {
        showSuccess(
          ids.length === 1
            ? `${moduleLabels.singular} excluída!`
            : `${ids.length} ${moduleLabels.plural.toLowerCase()} excluídas!`
        );
        return;
      }

      const results = await Promise.all(persistedIds.map((id) => moduleRepository.delete(id)));
      const lastContadores = results.filter((r) => r?.contadores).at(-1)?.contadores;
      if (lastContadores) setMetricsCache(queryClient, lastContadores);
      showSuccess(
        ids.length === 1
          ? `${moduleLabels.singular} excluída!`
          : `${ids.length} ${moduleLabels.plural.toLowerCase()} excluídas!`
      );
    } catch (error) {
      cacheSnapshot.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (metricsSnapshot) {
        queryClient.setQueryData(["metrics-contadores"], metricsSnapshot);
      }
      replaceEmpresasInSelector(selectorSnapshot);
      showError(
        resolveErrorMessage(
          error,
          `Não foi possível excluir ${moduleLabels.singular.toLowerCase()}.`
        )
      );
      throw error;
    } finally {
      saveCycle.end();
    }
  };

  const [exportBusy, setExportBusy] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const buildExportParams = useCallback(
    (format) => ({
      format,
      search: normalizeSearchQuery(searchTerm),
      sortBy: querySort.key,
      sortDir: querySort.direction,
      filters: JSON.stringify(listFilters ?? {}),
      ...(selectedTableItems.length > 0 ? { ids: selectedTableItems.join(",") } : {}),
    }),
    [searchTerm, querySort, listFilters, selectedTableItems]
  );

  const handleExportPdf = async () => {
    if (exportBusy || !saveCycle.guardAction("Aguarde a exportação terminar.")) return;
    if (pinnedRecord) {
      const config = getEmpPdfExportConfig();
      const srcCols = config.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
      const selCols = config.useConfiguredColumns && config.columnIds.length ? srcCols.filter((c) => config.columnIds.includes(c.id)) : srcCols;
      const rows = buildEmpresaExportRows([pinnedRecord], selCols);
      printCadastroTable({ columns: selCols, rows, totalRows: [], title: `${moduleLabels.title} - ${new Date().toLocaleDateString("pt-BR")}` });
      return;
    }
    setExportBusy(true);
    setExportMessage("Preparando exportação...");
    try {
      await moduleRepository.downloadExport(buildExportParams("csv"));
      showSuccess("Exportação concluída.");
    } catch (error) {
      showError(resolveErrorMessage(error, "Não foi possível exportar."));
    } finally {
      setExportBusy(false);
      setExportMessage("");
    }
  };

  const handleExportExcel = async () => {
    if (exportBusy || !saveCycle.guardAction("Aguarde a exportação terminar.")) return;
    setExportBusy(true);
    setExportMessage("Preparando exportação...");
    try {
      await moduleRepository.downloadExport(buildExportParams("excel"));
      showSuccess("Exportação concluída.");
    } catch (error) {
      showError(resolveErrorMessage(error, "Não foi possível exportar."));
    } finally {
      setExportBusy(false);
      setExportMessage("");
    }
  };

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

  return (
    <div className="cadastro-emp-scope mg-empresas-scope flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <div className="flex min-h-0 flex-1 overflow-hidden">
        <MgFilterPanel
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
            <MgActionBar
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
            onNew={handleNew}
            onSave={formBridge?.onSave}
            onCancel={formBridge?.onCancel ?? formCancel}
            onEdit={
              showForm
                ? formBridge?.onEdit
                : () => selectedTableEmp && handleEdit(selectedTableEmp)
            }
            onDelete={
              showForm
                ? () => editingEmp?.id && handleRequestDelete(editingEmp.id)
                : () => selectedTableItems.length > 0 && handleRequestDelete(selectedTableItems)
            }
            onDuplicate={
              showForm
                ? () => editingEmp && handleDuplicate(editingEmp)
                : () => selectedTableEmp && handleDuplicate(selectedTableEmp)
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
            onExportExcel={handleExportExcel}
            onExportPdf={handleExportPdf}
            onConfigColumns={() => setShowConfigColunas(true)}
            onLayoutConfig={formBridge?.onLayoutConfig}
            actionsLocked={saveCycle.isSaving}
            secondaryToolsLocked={actionBarVisibility.secondaryToolsLocked}
            layoutConfigMode={!!formBridge?.layoutConfigOpen && !!formBridge?.layoutToolbar}
            layoutToolbar={formBridge?.layoutToolbar}
            {...actionBarVisibility}
            />

            <div className={`mg-context-panel-wrap${showForm && !formBridge?.layoutConfigOpen ? " is-visible" : ""}`}>
              <MgContextPanel
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
              <MgCardsPanelStrip
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
                onConfigureFilters={toggleFilterPanel}
                filterPanelActive={filterPanelOpen}
              />
            </div>

            <div className={`mg-table-panel-wrap${!showForm && mgViewMode === "tabela" ? " is-visible" : ""}`}>
              <MgTablePanelStrip
                onConfigColumns={() => setShowConfigColunas(true)}
                disabled={filterControlsDisabled}
                filterFields={filterFields}
                empresas={empresasFiltradasPainel}
                filterValues={filterValues}
                appliedFilterValues={appliedFilterValues}
                onFilterChange={handleFilterChange}
                onFilterClear={handleFilterClear}
                onFilterApply={handleFilterApply}
                onConfigureFilters={toggleFilterPanel}
                filterPanelActive={filterPanelOpen}
              />
            </div>
          </div>

          <div className="mg-view-stack flex min-h-0 flex-1 flex-col overflow-hidden">
            {showForm ? (
              <div
                className="mg-view-layer mg-view-layer--form mg-view-layer--active flex min-h-0 flex-1 flex-col overflow-hidden"
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
                    onToolbarBridge: setFormBridge,
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
            ) : mgViewMode === "cards" ? (
              <div
                className="mg-view-layer mg-view-layer--cards mg-view-layer--active flex min-h-0 flex-1 flex-col overflow-hidden"
                aria-hidden={false}
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
            ) : (
              <div className="mg-view-layer mg-view-layer--table mg-grid-wrapper mg-view-layer--active mg-view-panel flex min-h-0 flex-1 flex-col overflow-hidden">
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
                    onServerSortChange: (nextSort) => {
                      setQuerySort(nextSort);
                      setQueryPage(1);
                    },
                    onRequestDistinctColumnValues: handleDistinctColumnValues,
                    moduleTitle: moduleLabels.title,
                    mgPrototype: true,
                    infiniteMode: true,
                    hasMoreRows: hasNextEmpresasPage && canLoadMoreRows,
                    onLoadMoreRows: handleLoadMoreEmpresas,
                    isLoadingMoreRows: isFetchingNextEmpresasPage,
                    loadBatchSize,
                    onLoadBatchSizeChange: handleLoadBatchSizeChange,
                    selectedCount: selectedTableItems.length,
                    listedCount: loadedRecordsCount,
                    filteredCount: filteredRecordsCount,
                    totalCount: totalRecordsCount,
                  }}
                />
              </div>
            )}
          </div>
        </div>
      </div>

      <MgMobileViewBar
        value={mgViewMode}
        onChange={handleMgViewModeChange}
        disabled={saveCycle.isSaving || actionBarVisibility.secondaryToolsLocked}
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
    </div>
  );
}