import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { showSuccess, showError } from "@/shared/feedback";
import { useAuth } from "@/shared/contexts/AuthContext";
import { cadcpsModuleDefinition } from "@/modules/cadcps/config/moduleDefinition";
import repCps from "@/modules/cadcps/repositories/repCps";
import {
  CamposDialogs,
  CamposFormPanel,
  CamposTablePanel,
} from "./PAGCPS.sections";
import { MetricsApi } from "@/apis/metrics/MetricsApi";
import { patchMetricsCache, setMetricsCache } from "@/apis/metrics/metricsCache";
import { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
import { useServerListQuery } from "@/shared/hooks/useServerListQuery";
import { useServerRecordNavigation } from "@/shared/hooks/useServerRecordNavigation";
import { LIST_DEFAULT_PAGE_SIZE } from "@/shared/listing/listQueryConfig";
import { buildCadcpsColumnFilters } from "@/shared/listing/buildCadcpsColumnFilters";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";
import { useSaveCycle } from "@/shared/hooks/useSaveCycle";
import { isPendingRecordId } from "@/shared/utils/pendingRecordUtils";

const DEFAULT_RESPONSE = {
  items: [],
  total: 0,
  page: 1,
  pageSize: LIST_DEFAULT_PAGE_SIZE,
  totalPages: 1,
};

const moduleRepository = cadcpsModuleDefinition.repository;
const moduleLabels = {
  singular: cadcpsModuleDefinition.singularLabel,
  plural: cadcpsModuleDefinition.pluralLabel,
  title: `Cadastro de ${cadcpsModuleDefinition.pluralLabel}`,
};

const findCampoInList = (list, record) =>
  list.find((item) => item.id === record?.id) || null;

const patchCamposCache = (queryClient, updater) => {
  queryClient.setQueriesData({ queryKey: ["cadcps-campos"] }, (previous) => {
    if (!previous?.items) return previous;
    return updater(previous);
  });
};

export default function PAGCPS() {
  const { empresas: empresasSelector } = useAuth();
  const queryClient = useQueryClient();
  const saveCycle = useSaveCycle();

  const resolveErrorMessage = (error, fallback) => {
    const apiMessage = error?.data?.message || error?.message;
    if (apiMessage && String(apiMessage).trim()) return String(apiMessage);
    return fallback;
  };

  const [showForm, setShowForm] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deleteState, setDeleteState] = useState({ open: false, ids: [] });
  const [viewMode, setViewMode] = useState("table");
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [searchDraft, setSearchDraft] = useState("");
  const debouncedSearch = useDebouncedValue(normalizeSearchQuery(searchDraft));
  const [selectedTableItems, setSelectedTableItems] = useState([]);
  const [formVersion, setFormVersion] = useState(0);
  const [returnRecordAfterNew, setReturnRecordAfterNew] = useState(null);
  const [visibleTableData, setVisibleTableData] = useState({ columns: [], rows: [] });
  const [tableFilteredCampos, setTableFilteredCampos] = useState(null);
  const [queryPage, setQueryPage] = useState(1);
  const [queryPageSize, setQueryPageSize] = useState(LIST_DEFAULT_PAGE_SIZE);
  const [querySort, setQuerySort] = useState({ key: "codigo", direction: "asc" });
  const [columnFilters, setColumnFilters] = useState({});
  const pendingDeleteIdsRef = useRef([]);
  const pendingCreatesRef = useRef(new Map());

  const listFilters = useMemo(
    () => buildCadcpsColumnFilters(columnFilters),
    [columnFilters]
  );
  const listFiltersKey = useMemo(() => JSON.stringify(listFilters ?? {}), [listFilters]);

  const {
    items: campos,
    total: totalCampos,
    isInitialLoading: camposLoading,
    isPageFetching: camposFetching,
  } = useServerListQuery({
    queryKey: ["cadcps-campos", queryPage, queryPageSize, debouncedSearch, querySort.key, querySort.direction, listFiltersKey],
    queryFn: () =>
      moduleRepository.listPage({
        page: queryPage,
        pageSize: queryPageSize,
        search: debouncedSearch,
        sortBy: querySort.key,
        sortDir: querySort.direction,
        filters: listFilters,
      }),
    defaultResponse: DEFAULT_RESPONSE,
  });

  const { data: contadores = { empresas: 0, registrosGlobais: 0 } } = useQuery({
    queryKey: ["metrics-contadores"],
    queryFn: () => MetricsApi.getContadores(),
    staleTime: Number.POSITIVE_INFINITY,
    gcTime: 30 * 60_000,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });

  const { data: telas = [] } = useQuery({
    queryKey: ["cadcps-telas"],
    queryFn: () => repCps.listTelas(),
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    placeholderData: [],
    refetchOnMount: false,
  });

  const handleFilteredCamposChange = useCallback((filtered) => {
    setTableFilteredCampos(filtered);
  }, []);

  const handleColumnFiltersChange = useCallback((nextColumnFilters) => {
    setColumnFilters(nextColumnFilters || {});
    setQueryPage(1);
  }, []);

  const recordNav = useServerRecordNavigation({
    items: campos,
    total: totalCampos,
    page: queryPage,
    pageSize: queryPageSize,
    onPageChange: setQueryPage,
    disabled: !showForm || viewMode !== "record",
  });

  useEffect(() => {
    if (!showForm || viewMode !== "record") return;
    if (!editingItem?.id || editingItem._isDuplicate) return;
    const record = recordNav.currentRecord;
    if (record?.id && record.id !== editingItem.id) {
      setEditingItem(record);
      setSelectedTableItems([record.id]);
    }
  }, [recordNav.currentRecord?.id, showForm, viewMode, editingItem?.id, editingItem?._isDuplicate]);

  const camposNavegacao = campos;

  const formulaFields = useMemo(
    () =>
      campos
        .filter((c) => c.tipo !== "formula")
        .map((c) => ({ id: c.field_name, field_name: c.field_name, label: c.nome })),
    [campos]
  );

  const refreshNavRecord = useCallback(
    (list, record, navListOverride) => {
      const navList = navListOverride ?? tableFilteredCampos ?? list;
      const fresh = findCampoInList(list, record) ?? record;
      const navIndex = navList.findIndex((item) => item.id === fresh.id);
      return { fresh, navList, navIndex };
    },
    [tableFilteredCampos]
  );

  const currentCampo = camposNavegacao[selectedIndex] || camposNavegacao[0] || null;
  const selectedTableCampo =
    selectedTableItems.length === 1
      ? camposNavegacao.find((item) => item.id === selectedTableItems[0])
      : null;

  const stayOnRecordAfterSave = useCallback(
    (savedRecord) => {
      const savedId = savedRecord?.id;
      if (!savedId) {
        setShowForm(true);
        setViewMode("record");
        return;
      }
      setReturnRecordAfterNew(null);
      setEditingItem(savedRecord);
      setSelectedTableItems([savedId]);
      setShowForm(true);
      setViewMode("record");

      patchCamposCache(queryClient, (previous) => {
        const exists = previous.items.some((item) => item.id === savedId);
        const items = exists
          ? previous.items.map((item) => (item.id === savedId ? { ...item, ...savedRecord } : item))
          : [savedRecord, ...previous.items];
        return {
          ...previous,
          items,
          total: exists ? previous.total : previous.total + 1,
        };
      });

      const navList = tableFilteredCampos ?? campos;
      const navIndex = navList.findIndex((item) => item.id === savedId);
      if (navIndex >= 0) setSelectedIndex(navIndex);
    },
    [queryClient, tableFilteredCampos, campos]
  );

  const handleSubmit = useCallback(
    (data) => {
      if (saveCycle.isSaving) return;

      const isUpdate = Boolean(
        editingItem?.id && !isPendingRecordId(editingItem.id) && !editingItem._isDuplicate
      );

      try {
        const validatedData = cadcpsModuleDefinition.schema.parse(data);
        saveCycle.beginSave();

        if (isUpdate) {
          const optimistic = { ...editingItem, ...validatedData };
          const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["cadcps-campos"] });

          patchCamposCache(queryClient, (previous) => ({
            ...previous,
            items: previous.items.map((item) =>
              item.id === editingItem.id ? { ...item, ...optimistic } : item
            ),
          }));
          setEditingItem(optimistic);
          stayOnRecordAfterSave(optimistic);

          void moduleRepository
            .update(editingItem.id, validatedData)
            .then((savedRecord) => {
              patchCamposCache(queryClient, (previous) => ({
                ...previous,
                items: previous.items.map((item) =>
                  item.id === editingItem.id ? { ...item, ...savedRecord } : item
                ),
              }));
              setEditingItem(savedRecord);
              showSuccess(`${moduleLabels.singular} atualizado!`);
            })
            .catch((error) => {
              cacheSnapshot.forEach(([key, value]) => {
                queryClient.setQueryData(key, value);
              });
              showError(
                resolveErrorMessage(
                  error,
                  `Não foi possível atualizar o ${moduleLabels.singular.toLowerCase()}.`
                )
              );
            })
            .finally(() => saveCycle.end());
          return;
        }

        const { _isDuplicate, ...clean } = validatedData;
        const pendingId = `pending-${crypto.randomUUID()}`;
        const optimistic = {
          ...clean,
          id: pendingId,
          _isPersisting: true,
        };
        const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["cadcps-campos"] });
        const metricsSnapshot = queryClient.getQueryData(["metrics-contadores"]);
        const createEntry = { cancelled: false };
        pendingCreatesRef.current.set(pendingId, createEntry);

        patchCamposCache(queryClient, (previous) => ({
          ...previous,
          items: [optimistic, ...previous.items],
          total: previous.total + 1,
        }));
        patchMetricsCache(queryClient, { registrosGlobais: 1 });
        stayOnRecordAfterSave(optimistic);
        setFormVersion((version) => version + 1);

        void moduleRepository
          .create(clean)
          .then(async (response) => {
            const savedRecord = response?.item;
            pendingCreatesRef.current.delete(pendingId);

            if (createEntry.cancelled) {
              try {
                const deleteResponse = await moduleRepository.remove(savedRecord.id);
                if (deleteResponse?.contadores) {
                  setMetricsCache(queryClient, deleteResponse.contadores);
                }
              } catch {
                // UI já removeu o registro pendente
              }
              return;
            }

            patchCamposCache(queryClient, (previous) => ({
              ...previous,
              items: previous.items.map((item) =>
                item.id === pendingId ? savedRecord : item
              ),
            }));
            setEditingItem((current) => (current?.id === pendingId ? savedRecord : current));
            setSelectedTableItems((current) =>
              current.includes(pendingId) ? [savedRecord.id] : current
            );
            setMetricsCache(queryClient, response?.contadores);
            showSuccess(`${moduleLabels.singular} cadastrado!`);
          })
          .catch((error) => {
            pendingCreatesRef.current.delete(pendingId);
            if (!createEntry.cancelled) {
              if (metricsSnapshot) {
                queryClient.setQueryData(["metrics-contadores"], metricsSnapshot);
              } else {
                patchMetricsCache(queryClient, { registrosGlobais: -1 });
              }
              cacheSnapshot.forEach(([key, value]) => {
                queryClient.setQueryData(key, value);
              });
              patchCamposCache(queryClient, (previous) => ({
                ...previous,
                items: previous.items.filter((item) => item.id !== pendingId),
                total: Math.max(0, previous.total - 1),
              }));
            }
            showError(
              resolveErrorMessage(
                error,
                `Não foi possível cadastrar o ${moduleLabels.singular.toLowerCase()}.`
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
              ? `Não foi possível atualizar o ${moduleLabels.singular.toLowerCase()}.`
              : `Não foi possível cadastrar o ${moduleLabels.singular.toLowerCase()}.`
          )
        );
      }
    },
    [editingItem, queryClient, saveCycle, stayOnRecordAfterSave]
  );

  const handleEdit = (item) => {
    if (!saveCycle.guardAction()) return;
    recordNav.syncLocalIndexFromRecord(item);
    setSelectedTableItems([item.id]);
    setEditingItem(item);
    setShowForm(true);
    setViewMode("record");
    setFormVersion((version) => version + 1);
  };

  const handleNew = () => {
    if (!saveCycle.guardAction()) return;
    setReturnRecordAfterNew(
      showForm && viewMode === "record" ? editingItem || currentCampo : null
    );
    setEditingItem(null);
    setShowForm(true);
    setViewMode("record");
    setFormVersion((version) => version + 1);
  };

  const handleDuplicate = (item) => {
    if (!saveCycle.guardAction()) return;
    setReturnRecordAfterNew(showForm && viewMode === "record" ? item : null);
    const { id, createdAt, updatedAt, codigo, id_global, _isPersisting, ...dup } = item;
    setEditingItem({ ...dup, _isDuplicate: true });
    setShowForm(true);
    setViewMode("record");
    setFormVersion((version) => version + 1);
  };

  const handleRequestDelete = (ids) => {
    if (!saveCycle.guardAction()) return;
    const normalized = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
    pendingDeleteIdsRef.current = normalized;
    setDeleteState({ open: true, ids: normalized });
  };

  const handleSearchChange = useCallback((value) => {
    setSearchDraft(normalizeSearchQuery(value));
    setQueryPage(1);
  }, []);

  useEffect(() => {
    if (!showForm || viewMode !== "record" || !editingItem || editingItem?._isDuplicate) return;
    if (camposNavegacao.length === 0) return;

    const currentFilteredIndex = editingItem.id
      ? camposNavegacao.findIndex((item) => item.id === editingItem.id)
      : -1;

    if (currentFilteredIndex >= 0) {
      if (selectedIndex !== currentFilteredIndex) setSelectedIndex(currentFilteredIndex);
      const fresh = camposNavegacao[currentFilteredIndex];
      if (fresh?.id === editingItem.id && fresh.updatedAt !== editingItem.updatedAt) {
        setEditingItem(fresh);
      }
    }
  }, [
    showForm,
    viewMode,
    camposNavegacao,
    editingItem?.id,
    editingItem?.updatedAt,
    editingItem?._isDuplicate,
    selectedIndex,
  ]);

  const handleTableSelectionChange = useCallback(
    (ids) => {
      setSelectedTableItems((previous) => {
        const same =
          previous.length === ids.length && previous.every((id, index) => id === ids[index]);
        return same ? previous : ids;
      });
      if (ids.length === 1) {
        const index = camposNavegacao.findIndex((item) => item.id === ids[0]);
        if (index >= 0) setSelectedIndex(index);
      }
    },
    [camposNavegacao]
  );

  const handleToggleView = () => {
    if (!saveCycle.guardAction()) return;
    if (showForm) {
      setShowForm(false);
      setEditingItem(null);
      setViewMode("table");
      return;
    }
    if (selectedTableItems.length > 1) return;
    const item = selectedTableCampo || camposNavegacao[selectedIndex] || camposNavegacao[0];
    if (!item) return;
    const index = camposNavegacao.findIndex((entry) => entry.id === item.id);
    if (index >= 0) setSelectedIndex(index);
    setEditingItem(item);
    setShowForm(true);
    setViewMode("record");
    setFormVersion((version) => version + 1);
  };

  const navigateRecord = (direction) => {
    if (!showForm || !saveCycle.guardAction()) return;
    if (direction === "first") recordNav.navigateFirst();
    else if (direction === "last") recordNav.navigateLast();
    else if (direction === "prev") recordNav.navigatePrevious();
    else recordNav.navigateNext();
  };

  const handleConfirmDelete = async () => {
    const ids =
      pendingDeleteIdsRef.current.length > 0 ? pendingDeleteIdsRef.current : deleteState.ids;
    if (ids.length === 0) {
      showError("Nenhum registro selecionado para exclusão.");
      throw new Error("Nenhum registro selecionado para exclusão.");
    }

    saveCycle.beginDelete();

    const deletedCurrentFromForm =
      showForm && viewMode === "record" && editingItem?.id && ids.includes(editingItem.id);
    const navListBeforeDelete = camposNavegacao;
    const navIndexBeforeDelete = deletedCurrentFromForm
      ? navListBeforeDelete.findIndex((item) => item.id === editingItem.id)
      : -1;

    const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["cadcps-campos"] });
    const metricsSnapshot = queryClient.getQueryData(["metrics-contadores"]);

    patchCamposCache(queryClient, (previous) => ({
      ...previous,
      items: previous.items.filter((item) => !ids.includes(item.id)),
      total: Math.max(0, previous.total - ids.length),
    }));
    patchMetricsCache(queryClient, { registrosGlobais: -ids.length });

    const list = navListBeforeDelete.filter((item) => !ids.includes(item.id));

    if (deletedCurrentFromForm) {
      const remainingNav = navListBeforeDelete
        .filter((item) => !ids.includes(item.id))
        .map((item) => findCampoInList(list, item))
        .filter(Boolean);

      if (remainingNav.length === 0) {
        setShowForm(false);
        setEditingItem(null);
        setViewMode("table");
        setSelectedTableItems([]);
        setSelectedIndex(0);
      } else {
        const nextIndex = Math.min(Math.max(navIndexBeforeDelete, 0), remainingNav.length - 1);
        const nextItem = remainingNav[nextIndex];
        setEditingItem(nextItem);
        setSelectedIndex(nextIndex);
        setSelectedTableItems([nextItem.id]);
        setShowForm(true);
        setViewMode("record");
      }
    } else {
      setSelectedTableItems((previous) => previous.filter((id) => !ids.includes(id)));
      if (list.length === 0) setSelectedIndex(0);
      else setSelectedIndex((previous) => Math.min(previous, list.length - 1));
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
            ? `${moduleLabels.singular} excluído!`
            : `${ids.length} ${moduleLabels.plural.toLowerCase()} excluídos!`
        );
        return;
      }

      const results = await Promise.all(persistedIds.map((id) => moduleRepository.remove(id)));
      const lastContadores = results.filter((r) => r?.contadores).at(-1)?.contadores;
      if (lastContadores) setMetricsCache(queryClient, lastContadores);
      showSuccess(
        ids.length === 1
          ? `${moduleLabels.singular} excluído!`
          : `${ids.length} ${moduleLabels.plural.toLowerCase()} excluídos!`
      );
    } catch (error) {
      cacheSnapshot.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      if (metricsSnapshot) {
        queryClient.setQueryData(["metrics-contadores"], metricsSnapshot);
      }
      showError(
        resolveErrorMessage(
          error,
          `Não foi possível excluir o ${moduleLabels.singular.toLowerCase()}.`
        )
      );
      throw error;
    } finally {
      saveCycle.end();
    }
  };

  return (
    <div className="cadastro-emp-scope flex h-full min-h-0 flex-1 flex-col overflow-hidden">
      <CamposFormPanel
        showForm={showForm}
        formProps={{
          key: `form-${formVersion}`,
          initialData: editingItem,
          recordKey: editingItem?.id ?? (editingItem?._isDuplicate ? "duplicate" : "new"),
          isEditing: !!editingItem,
          telas,
          empresas: empresasSelector || [],
          formulaFields,
          onSubmit: handleSubmit,
          onCancel: () => {
            if (editingItem && !editingItem._isDuplicate) {
              setFormVersion((version) => version + 1);
              setViewMode("record");
              return;
            }
            if ((editingItem?._isDuplicate || !editingItem) && returnRecordAfterNew) {
              setEditingItem(returnRecordAfterNew);
              setShowForm(true);
              setViewMode("record");
              setReturnRecordAfterNew(null);
              return;
            }
            setShowForm(false);
            setEditingItem(null);
            setViewMode("table");
            setReturnRecordAfterNew(null);
          },
          onToggleView: handleToggleView,
          total: recordNav.effectiveTotal,
          currentIndex: recordNav.globalIndex,
          onNew: handleNew,
          onFirst: () => navigateRecord("first"),
          onPrevious: () => navigateRecord("prev"),
          onNext: () => navigateRecord("next"),
          onLast: () => navigateRecord("last"),
          onDelete: () => editingItem?.id && handleRequestDelete(editingItem.id),
          onDuplicate: () => editingItem && handleDuplicate(editingItem),
          searchValue: searchDraft,
          onSearchChange: handleSearchChange,
          actionsLocked: saveCycle.isSaving,
        }}
      />

      <CamposTablePanel
        hidden={showForm}
        toolbarProps={{
          actionsLocked: saveCycle.isSaving,
          viewMode,
          total: totalCampos,
          currentIndex: selectedIndex,
          searchValue: searchDraft,
          onSearchChange: handleSearchChange,
          onNew: handleNew,
          onToggleView: handleToggleView,
          toggleViewDisabled: selectedTableItems.length > 1,
          filterActive: Boolean(debouncedSearch || listFilters),
          onDelete: () => selectedTableItems.length > 0 && handleRequestDelete(selectedTableItems),
          onDuplicate: () => selectedTableCampo && handleDuplicate(selectedTableCampo),
          selectedCount: selectedTableItems.length,
          title: moduleLabels.title,
          recordLabel: "",
        }}
        tableProps={{
          key: "tbl-cps",
          campos,
          isLoadingCampos: camposLoading,
          isFetchingCampos: camposFetching,
          onEdit: handleEdit,
          searchTerm: "",
          selectedRecordId: showForm ? editingItem?.id : undefined,
          onSelectionChange: handleTableSelectionChange,
          onVisibleDataChange: setVisibleTableData,
          onFilteredCamposChange: handleFilteredCamposChange,
          serverPage: queryPage,
          serverPageSize: queryPageSize,
          serverTotal: totalCampos,
          onServerPageChange: setQueryPage,
          onServerPageSizeChange: (nextPageSize) => {
            setQueryPageSize(nextPageSize);
            setQueryPage(1);
          },
          onServerSortChange: (nextSort) => {
            setQuerySort(nextSort);
            setQueryPage(1);
          },
          onServerColumnFiltersChange: handleColumnFiltersChange,
          moduleTitle: moduleLabels.title,
        }}
      />

      <CamposDialogs
        confirmDeleteProps={{
          open: deleteState.open,
          onOpenChange: (open) => setDeleteState((previous) => ({ ...previous, open })),
          title: "Confirmar exclusão",
          description:
            deleteState.ids.length > 1
              ? `Deseja excluir ${deleteState.ids.length} ${moduleLabels.plural.toLowerCase()}?`
              : `Deseja excluir este ${moduleLabels.singular.toLowerCase()}?`,
          confirmText: "Excluir",
          cancelText: "Cancelar",
          variant: "destructive",
          onConfirm: handleConfirmDelete,
        }}
      />
    </div>
  );
}
