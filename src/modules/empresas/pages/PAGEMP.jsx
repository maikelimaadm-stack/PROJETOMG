import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/shared/feedback";
import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { findEmpresaInList, normalizeEmpresaRecord } from "@/modules/empresas/utils/empCodigoUtils";
import { useAuth } from "@/shared/contexts/AuthContext";
import { printCadastroTable, exportCadastroTableToExcel } from "@/framework/cadastro/exports/tableExportUtils";
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
import MgFilterPanel from "@/modules/empresas/layout/MgFilterPanel";
import MgContextPanel from "@/modules/empresas/layout/MgContextPanel";
import MgMobileViewBar from "@/modules/empresas/layout/MgMobileViewBar";
import { useMgEmpresasChrome } from "@/modules/empresas/layout/MgEmpresasChromeContext";
import { applyMgViewMode, resolveMgViewMode } from "@/modules/empresas/layout/mgViewMode";
import { resolveMgActionBarVisibility } from "@/modules/empresas/layout/mgActionBarRules";
import { useEmpCardsVisFields } from "@/modules/empresas/hooks/useEmpCardsVisFields";
import { useEmpSearchDropdownFields } from "@/modules/empresas/hooks/useEmpSearchDropdownFields";
import { useEmpFavorites } from "@/modules/empresas/hooks/useEmpFavorites";
import { useServerListQuery } from "@/shared/hooks/useServerListQuery";
import { useServerRecordNavigation } from "@/shared/hooks/useServerRecordNavigation";
import { fetchAllListPages } from "@/shared/utils/fetchAllListPages";
import {
  LIST_DEFAULT_PAGE_SIZE,
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
import { isPendingRecordId } from "@/shared/utils/pendingRecordUtils";
import { useSaveCycle } from "@/shared/hooks/useSaveCycle";
import SaveProgressOverlay from "@/shared/components/SaveProgressOverlay";

const DEFAULT_EMPRESAS_RESPONSE = {
  items: [],
  total: 0,
  page: 1,
  pageSize: LIST_DEFAULT_PAGE_SIZE,
  totalPages: 1,
};

const DROPDOWN_PREVIEW_SIZE = 10;

const moduleRepository = empresasModuleDefinition.repository;
const moduleLabels = {
  singular: empresasModuleDefinition.singularLabel,
  plural: empresasModuleDefinition.pluralLabel,
  title: `Cadastro de ${empresasModuleDefinition.pluralLabel}`,
};

const patchEmpresasCache = (queryClient, updater) => {
  queryClient.setQueriesData({ queryKey: ["emp-cadastro"] }, (previous) => {
    if (!previous?.items) return previous;
    return updater(previous);
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
  const [visibleTableData, setVisibleTableData] = useState({ columns: [], rows: [] });
  const [tableFilteredEmpresas, setTableFilteredEmpresas] = useState(null);
  const [queryPage, setQueryPage] = useState(1);
  const [queryPageSize, setQueryPageSize] = useState(LIST_DEFAULT_PAGE_SIZE);
  const [querySort, setQuerySort] = useState({ key: "codempresa", direction: "asc" });
  const [appliedPanelFilters, setAppliedPanelFilters] = useState(undefined);
  const [columnFilters, setColumnFilters] = useState({});
  const [tableColumnsInUse, setTableColumnsInUse] = useState([]);
  const cardsVisFields = useEmpCardsVisFields({ columnsInUseOverride: tableColumnsInUse });
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
  const [filterStatus, setFilterStatus] = useState("Todos");
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
    setQueryPage(1);
    setTableFilteredEmpresas(null);
    setSearchDraft("");
    setSearchTerm("");
    setPinnedRecord(null);
    setSearchFavoritesOnly(false);
    setDropdownSearch("");
  }, [selectedEmpresaId]);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDropdownSearch(normalizeSearchQuery(searchDraft));
    }, LIST_SEARCH_DEBOUNCE_MS);
    return () => window.clearTimeout(timer);
  }, [searchDraft]);

  const searchDraftNormalized = normalizeSearchQuery(searchDraft);
  const dropdownSearchPending = searchDraftNormalized !== dropdownSearch;

  const { data: dropdownResponse, isFetching: dropdownSourceFetching } = useQuery({
    queryKey: ["emp-cadastro-dropdown", dropdownSearch, querySort.key, querySort.direction],
    queryFn: () =>
      moduleRepository.listPage({
        page: 1,
        pageSize: DROPDOWN_PREVIEW_SIZE,
        search: dropdownSearch,
        sortBy: querySort.key,
        sortDir: querySort.direction,
      }),
    enabled: dropdownSearch.length > 0,
    staleTime: 30_000,
    gcTime: 5 * 60_000,
  });

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

  const dropdownSearchResults = dropdownSearchPending ? [] : dropdownResponse?.items || [];
  const dropdownSearchResultsTotal = dropdownSearchPending ? 0 : dropdownResponse?.total || 0;
  const dropdownSearchHasFavorites = (dropdownFavoritesProbe?.total ?? 0) > 0;

  const dropdownSearchLoading =
    dropdownSearchPending ||
    (dropdownSearch.length > 0 && dropdownSourceFetching && dropdownSearchResults.length === 0);

  const listFilters = useMemo(
    () =>
      mergeEmpresaListFilters(
        appliedPanelFilters,
        buildEmpresaColumnFilters(columnFilters),
        searchFavoritesOnly ? { ids: favoriteIds } : undefined
      ),
    [appliedPanelFilters, columnFilters, searchFavoritesOnly, favoriteIds]
  );

  const listFiltersKey = useMemo(() => JSON.stringify(listFilters ?? {}), [listFilters]);

  const {
    items: empresas,
    total: empresasResponseTotal,
    isInitialLoading: empresasLoading,
    isPageFetching: empresasFetching,
    isLoading,
    isFetching,
  } = useServerListQuery({
    queryKey: [
      "emp-cadastro",
      queryPage,
      queryPageSize,
      searchTerm,
      querySort.key,
      querySort.direction,
      listFiltersKey,
    ],
    queryFn: async () => {
      const trimmedSearch = normalizeSearchQuery(searchTerm);

      if (searchFavoritesOnly && favoriteIds.length === 0) {
        return {
          ...DEFAULT_EMPRESAS_RESPONSE,
          pageSize: queryPageSize,
        };
      }

      return moduleRepository.listPage({
        page: queryPage,
        pageSize: queryPageSize,
        search: trimmedSearch,
        sortBy: querySort.key,
        sortDir: querySort.direction,
        filters: listFilters,
      });
    },
    defaultResponse: DEFAULT_EMPRESAS_RESPONSE,
  });

  const totalEmpresas = pinnedRecord ? 1 : empresasResponseTotal || 0;
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
    const record = recordNav.currentRecord;
    if (record?.id && record.id !== editingEmp?.id) {
      setEditingEmp(record);
      setSelectedTableItems([record.id]);
      setSelectedIndex(recordNav.localIndex);
    }
  }, [recordNav.currentRecord?.id, recordNav.localIndex, showForm, viewMode, pinnedRecord, editingEmp?.id]);

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
    setTableFilteredEmpresas(filtered);
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
    Object.values(columnFilters).some((values) => Array.isArray(values) && values.length > 0) ||
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
          .finally(() => saveCycle.end());
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
        .finally(() => saveCycle.end());
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
    setQueryPage(1);
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
    void queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });
  }, [searchDraft, queryClient]);

  const handleSearchApplyFavorites = useCallback(() => {
    searchViewApplyRef.current = "all";
    setSearchViewPending(true);
    setSearchFavoritesOnly(true);
    setPinnedRecord(null);
    setSearchTerm(normalizeSearchQuery(searchDraft));
    setQueryPage(1);
    setTableFilteredEmpresas(null);
    setSelectedTableItems([]);
    void queryClient.invalidateQueries({ queryKey: ["emp-cadastro"] });
  }, [searchDraft, queryClient]);

  const handleSearchResultSelect = useCallback(
    (emp) => {
      if (!emp) return;
      searchViewApplyRef.current = "single";
      setSearchViewPending(true);
      setSearchFavoritesOnly(false);
      setPinnedRecord(emp);
      setSearchTerm(normalizeSearchQuery(searchDraft));
      setQueryPage(1);
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
    setFilterStatus("Todos");
    setAppliedPanelFilters(undefined);
    setSearchDraft("");
    setSearchTerm("");
    setPinnedRecord(null);
    setSearchFavoritesOnly(false);
    setDropdownSearch("");
    setQueryPage(1);
  }, []);

  const handleFilterApply = useCallback(() => {
    setAppliedPanelFilters(buildEmpresaPanelFilters(filterValues, filterStatus));
    setQueryPage(1);
    closeFilterPanel();
  }, [closeFilterPanel, filterStatus, filterValues]);

  const handleColumnFiltersChange = useCallback((nextColumnFilters) => {
    setColumnFilters(nextColumnFilters || {});
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
      applyMgViewMode(mode, {
        onOpenRegistro: () => {
          if (showForm) return;
          const emp = selectedTableEmp || empresasNavegacao[selectedIndex] || empresasNavegacao[0];
          if (!emp) {
            handleNew();
            return;
          }
          handleEdit(emp);
        },
        onOpenTabela: () => {
          handleOpenTableView();
        },
        onOpenCards: () => {
          if (!saveCycle.guardAction()) return;
          if (showForm) {
            setShowForm(false);
            setEditingEmp(null);
            setSelectedTableItems([]);
          }
          setViewMode("search");
        },
      });
    },
    [
      empresasNavegacao,
      handleEdit,
      handleNew,
      handleOpenTableView,
      saveCycle,
      selectedIndex,
      selectedTableEmp,
      showForm,
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
    if (ids.length === 1) { const i = empresasNavegacao.findIndex((e) => e.id === ids[0]); if (i >= 0) setSelectedIndex(i); }
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

  const fetchExportEmpresas = useCallback(async () => {
    if (pinnedRecord) return [pinnedRecord];
    const listParams = {
      search: normalizeSearchQuery(searchTerm),
      sortBy: querySort.key,
      sortDir: querySort.direction,
      filters: listFilters,
    };
    const { items } = await fetchAllListPages({
      listPage: (params) => moduleRepository.listPage({ ...params, ...listParams }),
      onProgress: ({ loaded, total }) => {
        setExportMessage(`Preparando exportação... ${loaded}/${total}`);
      },
    });
    if (selectedTableItems.length > 0) {
      const selectedSet = new Set(selectedTableItems);
      return items.filter((item) => selectedSet.has(item.id));
    }
    return items;
  }, [pinnedRecord, selectedTableItems, searchTerm, querySort, listFilters]);

  const handleExportPdf = async () => {
    if (exportBusy || !saveCycle.guardAction("Aguarde a exportação terminar.")) return;
    setExportBusy(true);
    setExportMessage("Preparando exportação...");
    try {
      const sourceEmpresas = await fetchExportEmpresas();
      const config = getEmpPdfExportConfig();
      const srcCols = config.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
      const selCols = config.useConfiguredColumns && config.columnIds.length ? srcCols.filter((c) => config.columnIds.includes(c.id)) : srcCols;
      const rows = buildEmpresaExportRows(sourceEmpresas, selCols);
      const selIdx = selCols.map((c) => srcCols.findIndex((x) => x.id === c.id));
      const totalRows = visibleTableData.totalRows?.length ? visibleTableData.totalRows.map((row) => selIdx.map((i) => row[i])) : [];
      printCadastroTable({ columns: selCols, rows, totalRows, title: `${moduleLabels.title} - ${new Date().toLocaleDateString("pt-BR")}` });
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
      const sourceEmpresas = await fetchExportEmpresas();
      const config = getEmpExcelExportConfig();
      const srcCols = config.useConfiguredColumns ? visibleTableData.allColumns || visibleTableData.columns : visibleTableData.columns;
      const selCols = config.useConfiguredColumns && config.columnIds.length ? srcCols.filter((c) => config.columnIds.includes(c.id)) : srcCols;
      const rows = buildEmpresaExportRows(sourceEmpresas, selCols);
      const selIdx = selCols.map((c) => srcCols.findIndex((x) => x.id === c.id));
      const totalRows = visibleTableData.totalRows?.length ? visibleTableData.totalRows.map((row) => selIdx.map((i) => row[i])) : [];
      exportCadastroTableToExcel({ columns: selCols, rows, totalRows, title: `${moduleLabels.title} - ${new Date().toLocaleDateString("pt-BR")}` });
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

  return (
    <div className="cadastro-emp-scope mg-empresas-scope flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <SaveProgressOverlay
        active={saveCycle.isSaving || exportBusy}
        message={exportBusy ? exportMessage || "Preparando exportação..." : saveCycle.saveMessage}
        variant={saveCycle.variant}
      />

      <div className="flex min-h-0 flex-1 overflow-hidden">
        <MgFilterPanel
          open={filterPanelOpen}
          values={filterValues}
          onChange={handleFilterChange}
          onClose={closeFilterPanel}
          onClear={handleFilterClear}
          onApply={handleFilterApply}
          status={filterStatus}
          onStatusChange={setFilterStatus}
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
            onAttach={
              showForm
                ? () => editingEmp?.id && setAttachmentsRecord(editingEmp)
                : () => selectedTableEmp && setAttachmentsRecord(selectedTableEmp)
            }
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
              />
            </div>
          </div>

          <div className="mg-view-stack flex min-h-0 flex-1 flex-col overflow-hidden">
            <div
              className={`mg-view-layer mg-view-layer--form flex min-h-0 flex-1 flex-col overflow-hidden${
                showForm ? " mg-view-layer--active" : ""
              }`}
              aria-hidden={!showForm}
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
                  onToolbarBridge: showForm ? setFormBridge : undefined,
                  total: recordNav.effectiveTotal,
                  currentIndex: recordNav.globalIndex,
                  onDelete: () => editingEmp?.id && handleRequestDelete(editingEmp.id),
                  onDuplicate: () => editingEmp && handleDuplicate(editingEmp),
                  actionsLocked: saveCycle.isSaving,
                }}
              />
            </div>

            <div
              className={`mg-view-layer mg-view-layer--cards flex min-h-0 flex-1 flex-col overflow-hidden${
                !showForm && mgViewMode === "cards" ? " mg-view-layer--active" : ""
              }`}
              aria-hidden={showForm || mgViewMode !== "cards"}
            >
              <div id="mode-cards" className="mg-view-panel flex min-h-0 flex-1 flex-col overflow-hidden">
                <EmpresasSearchPanel
                  searchProps={{
                    empresas: empresasFiltradasPainel,
                    total: totalEmpresas,
                    isLoading: empresasLoading,
                    isFetching: empresasFetching,
                    searchValue: searchTerm,
                    onSearchChange: handleSearchCommit,
                    page: queryPage,
                    pageSize: queryPageSize,
                    onPageChange: setQueryPage,
                    onPageSizeChange: (nextPageSize) => {
                      setQueryPageSize(nextPageSize);
                      setQueryPage(1);
                    },
                    onEdit: handleEdit,
                    selectedIds: selectedTableItems,
                    onSelectionChange: handleTableSelectionChange,
                    cardsDetailFields: cardsVisFields.detailFields,
                    cardsPerRow: cardsVisFields.layoutConfig.cardsPerRow,
                    fieldsPerRow: cardsVisFields.fieldsPerRow,
                    isFavoriteRecord: empFavorites.isFavorite,
                    onToggleFavorite: empFavorites.toggleFavorite,
                    mgPrototype: true,
                  }}
                />
              </div>
            </div>

            <div
              className={`mg-view-layer mg-view-layer--table mg-grid-wrapper mg-view-panel flex min-h-0 flex-1 flex-col overflow-hidden${
                !showForm && mgViewMode !== "cards" ? " mg-view-layer--active" : ""
              }`}
              aria-hidden={showForm || mgViewMode === "cards"}
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
                  serverPage: queryPage,
                  serverPageSize: queryPageSize,
                  serverTotal: totalEmpresas,
                  onServerPageChange: setQueryPage,
                  onServerPageSizeChange: (nextPageSize) => {
                    setQueryPageSize(nextPageSize);
                    setQueryPage(1);
                  },
                  onServerSortChange: (nextSort) => {
                    setQuerySort(nextSort);
                    setQueryPage(1);
                  },
                  moduleTitle: moduleLabels.title,
                  mgPrototype: true,
                  onColumnsInUseChange: setTableColumnsInUse,
                }}
              />
            </div>
          </div>
        </div>
      </div>

      <MgMobileViewBar value={mgViewMode} onChange={handleMgViewModeChange} />

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
          open: !!attachmentsRecord?.id,
          onOpenChange: (open) => {
            if (!open) setAttachmentsRecord(null);
          },
          entityName: empresasModuleDefinition.entityName,
          recordId: attachmentsRecord?.id,
          title:
            attachmentsRecord?.razao_social ||
            attachmentsRecord?.codempresa ||
            moduleLabels.singular,
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