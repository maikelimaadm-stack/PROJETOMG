import { useCallback, useMemo, useRef, useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useSaveCycle } from "@/shared/hooks/useSaveCycle";
import { useServerListQuery, DEFAULT_LIST_RESPONSE } from "@/shared/hooks/useServerListQuery";
import { LIST_DEFAULT_PAGE_SIZE } from "@/shared/listing/listQueryConfig";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";
import { useMakModuleRequired } from "@/framework/mak/runtime/MakModuleContext.jsx";
import { buildMakColumnFilters, mergeMakListFilters } from "@/framework/mak/filters";
import { useMakRecordSubmit, useMakRecordDelete } from "@/framework/mak/records";
import { useMakPermissions } from "@/framework/mak/permissions";

const noopSelector = {
  upsert: () => {},
  remove: () => {},
  replace: () => {},
  snapshot: [],
};

/**
 * Orquestrador genérico de página de cadastro MAK (modo server pagination).
 */
export function useMakCadastroPage() {
  const module = useMakModuleRequired();
  const makPermissions = useMakPermissions();
  const queryClient = useQueryClient();
  const saveCycle = useSaveCycle();
  const pendingCreatesRef = useRef(new Map());

  const [showForm, setShowForm] = useState(false);
  const [editingRecord, setEditingRecord] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [] });
  const [viewMode, setViewMode] = useState("tabela");
  const [searchDraft, setSearchDraft] = useState("");
  const debouncedSearch = useDebouncedValue(normalizeSearchQuery(searchDraft));
  const [selectedTableItems, setSelectedTableItems] = useState([]);
  const [formVersion, setFormVersion] = useState(0);
  const [showConfigColunas, setShowConfigColunas] = useState(false);
  const [columnFilters, setColumnFilters] = useState({});
  const [visibleTableData, setVisibleTableData] = useState({ columns: [], rows: [] });
  const [queryPage, setQueryPage] = useState(1);
  const [queryPageSize, setQueryPageSize] = useState(LIST_DEFAULT_PAGE_SIZE);
  const [querySort, setQuerySort] = useState(
    module.metadata?.table?.defaultSort ?? { key: "codigo", direction: "asc" }
  );

  const listFilters = useMemo(
    () => buildMakColumnFilters(module.moduleId, columnFilters),
    [module.moduleId, columnFilters]
  );
  const listFiltersKey = useMemo(() => JSON.stringify(listFilters ?? {}), [listFilters]);

  const listQueryKey = useMemo(
    () => [
      ...(module.listQueryKey ?? [`${module.moduleId}-cadastro`]),
      queryPage,
      queryPageSize,
      debouncedSearch,
      querySort.key,
      querySort.direction,
      listFiltersKey,
    ],
    [module.listQueryKey, module.moduleId, queryPage, queryPageSize, debouncedSearch, querySort, listFiltersKey]
  );

  const {
    items: records,
    total: totalRecords,
    isInitialLoading: recordsLoading,
    isPageFetching: recordsFetching,
  } = useServerListQuery({
    queryKey: listQueryKey,
    queryFn: () =>
      module.repository.listPage({
        page: queryPage,
        pageSize: queryPageSize,
        search: debouncedSearch,
        sortBy: querySort.key,
        sortDir: querySort.direction,
        filters: listFilters,
      }),
    defaultResponse: DEFAULT_LIST_RESPONSE,
  });

  const resolveErrorMessage = useCallback((error, fallback) => {
    const apiMessage = error?.data?.message || error?.message;
    if (apiMessage && String(apiMessage).trim()) return String(apiMessage);
    return fallback;
  }, []);

  const stayOnRecordAfterSave = useCallback((savedRecord) => {
    if (!savedRecord?.id) {
      setShowForm(true);
      setViewMode("formulario");
      return;
    }
    setEditingRecord(savedRecord);
    setSelectedTableItems([savedRecord.id]);
    setShowForm(true);
    setViewMode("formulario");
  }, []);

  const selectorStub = useMemo(
    () => ({
      upsertInSelector: noopSelector.upsert,
      removeFromSelector: noopSelector.remove,
      replaceInSelector: noopSelector.replace,
      selectorSnapshot: noopSelector.snapshot,
    }),
    []
  );

  const { handleSubmit } = useMakRecordSubmit({
    editingRecord,
    selectorSnapshot: selectorStub.selectorSnapshot,
    pendingAttachments: [],
    pendingCreatesRef,
    moduleRepository: module.repository,
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
    setEditingRecord,
    setFormVersion,
    setSelectedTableItems,
    upsertInSelector: selectorStub.upsertInSelector,
    removeFromSelector: selectorStub.removeFromSelector,
    replaceInSelector: selectorStub.replaceInSelector,
    setPendingAttachments: () => {},
    attachmentPersistErrorMessage: module.attachmentPersistErrorMessage,
  });

  const pendingDeleteIdsRef = useRef([]);
  const [attachmentsRecord, setAttachmentsRecord] = useState(null);
  const [attachmentsOpen, setAttachmentsOpen] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);

  const refreshNavRecord = useCallback((list, record, navListOverride) => {
    const navList = navListOverride ?? list;
    const fresh = list.find((item) => item.id === record?.id) ?? record;
    const navIndex = navList.findIndex((item) => item.id === fresh?.id);
    return { fresh, navList, navIndex };
  }, []);

  const { handleConfirmDelete } = useMakRecordDelete({
    deleteState,
    setDeleteState,
    pendingDeleteIdsRef,
    pendingCreatesRef,
    moduleRepository: module.repository,
    moduleLabels: module.labels,
    listQueryKey: module.listQueryKey,
    patchListCache: module.patchListCache,
    metricsEntityKey: module.metricsEntityKey,
    queryClient,
    saveCycle,
    resolveErrorMessage,
    showForm,
    viewMode: viewMode === "formulario" ? "record" : viewMode,
    editingRecord,
    selectorState: selectorStub.selectorSnapshot,
    navigationList: records,
    attachmentsRecord,
    selectedTableItems,
    findRecordInList: module.findRecordInList,
    refreshNavRecord,
    removeFromSelector: selectorStub.removeFromSelector,
    replaceInSelector: selectorStub.replaceInSelector,
    setShowForm,
    setEditingRecord,
    setViewMode: (mode) => setViewMode(mode === "record" ? "formulario" : mode),
    setSelectedTableItems,
    setSelectedIndex,
    setFormVersion,
    setAttachmentsRecord,
    setAttachmentsOpen,
  });

  const handleEdit = useCallback((record) => {
    setEditingRecord(record);
    setShowForm(true);
    setViewMode("formulario");
    if (record?.id) setSelectedTableItems([record.id]);
  }, []);

  const handleNew = useCallback(() => {
    setEditingRecord(null);
    setShowForm(true);
    setViewMode("formulario");
    setFormVersion((v) => v + 1);
  }, []);

  const handleViewModeChange = useCallback((mode) => {
    setViewMode(mode);
    if (mode === "formulario" && selectedTableItems.length === 1) {
      const selected = records.find((item) => item.id === selectedTableItems[0]);
      if (selected) {
        setEditingRecord(selected);
        setShowForm(true);
      }
    } else if (mode !== "formulario") {
      setShowForm(false);
    }
  }, [records, selectedTableItems]);

  const handleColumnFiltersChange = useCallback((next) => {
    setColumnFilters(next || {});
    setQueryPage(1);
  }, []);

  const handleServerPageChange = useCallback((page) => setQueryPage(page), []);
  const handleServerPageSizeChange = useCallback((size) => {
    setQueryPageSize(size);
    setQueryPage(1);
  }, []);

  const handleServerSortChange = useCallback((sort) => {
    if (!sort?.key) return;
    setQuerySort({ key: sort.key, direction: sort.direction === "desc" ? "desc" : "asc" });
    setQueryPage(1);
  }, []);

  const handleRequestDelete = useCallback((ids) => {
    setDeleteState({ open: true, ids: Array.isArray(ids) ? ids : [ids].filter(Boolean) });
  }, []);

  const formCancel = useCallback(() => {
    setShowForm(false);
    setViewMode("tabela");
  }, []);

  return {
    module,
    makPermissions,
    labels: module.labels,
    showForm,
    viewMode,
    setViewMode: handleViewModeChange,
    searchDraft,
    setSearchDraft,
    debouncedSearch,
    records,
    totalRecords,
    recordsLoading,
    recordsFetching,
    editingRecord,
    selectedTableItems,
    setSelectedTableItems,
    formVersion,
    showConfigColunas,
    setShowConfigColunas,
    columnFilters,
    visibleTableData,
    setVisibleTableData,
    queryPage,
    queryPageSize,
    querySort,
    deleteState,
    setDeleteState,
    saveCycle,
    handleEdit,
    handleNew,
    handleSubmit,
    handleConfirmDelete,
    handleRequestDelete,
    handleColumnFiltersChange,
    handleServerPageChange,
    handleServerPageSizeChange,
    handleServerSortChange,
    formCancel,
  };
}
