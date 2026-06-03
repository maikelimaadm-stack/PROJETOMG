import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuth } from "@/shared/contexts/AuthContext";
import { cadcpsModuleDefinition } from "@/modules/cadcps/config/moduleDefinition";
import repCps from "@/modules/cadcps/repositories/repCps";
import {
  CamposDialogs,
  CamposFormPanel,
  CamposTablePanel,
} from "./PAGCPS.sections";

const DEFAULT_RESPONSE = {
  items: [],
  total: 0,
  page: 1,
  pageSize: 50,
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
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedTableItems, setSelectedTableItems] = useState([]);
  const [formVersion, setFormVersion] = useState(0);
  const [returnRecordAfterNew, setReturnRecordAfterNew] = useState(null);
  const [visibleTableData, setVisibleTableData] = useState({ columns: [], rows: [] });
  const [tableFilteredCampos, setTableFilteredCampos] = useState(null);
  const [queryPage, setQueryPage] = useState(1);
  const [queryPageSize, setQueryPageSize] = useState(50);
  const [querySort, setQuerySort] = useState({ key: "codigo", direction: "asc" });
  const pendingDeleteIdsRef = useRef([]);

  const { data: listResponse = DEFAULT_RESPONSE, isLoading, isFetching } = useQuery({
    queryKey: ["cadcps-campos", queryPage, queryPageSize, searchTerm, querySort.key, querySort.direction],
    queryFn: () =>
      moduleRepository.listPage({
        page: queryPage,
        pageSize: queryPageSize,
        search: searchTerm,
        sortBy: querySort.key,
        sortDir: querySort.direction,
      }),
    placeholderData: (previous) => previous ?? DEFAULT_RESPONSE,
    staleTime: 60_000,
    gcTime: 5 * 60_000,
  });

  const { data: telas = [] } = useQuery({
    queryKey: ["cadcps-telas"],
    queryFn: () => repCps.listTelas(),
  });

  const campos = listResponse.items || [];
  const totalCampos = listResponse.total || 0;
  const camposLoading = isLoading || (isFetching && campos.length === 0);

  const handleFilteredCamposChange = useCallback((filtered) => {
    setTableFilteredCampos(filtered);
  }, []);

  const camposNavegacao = tableFilteredCampos ?? campos;

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
      const isUpdate = Boolean(editingItem && !editingItem._isDuplicate);

      try {
        const validatedData = cadcpsModuleDefinition.schema.parse(data);

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
          toast.success(`${moduleLabels.singular} atualizado!`);

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
            })
            .catch((error) => {
              cacheSnapshot.forEach(([key, value]) => {
                queryClient.setQueryData(key, value);
              });
              toast.error(
                resolveErrorMessage(
                  error,
                  `Não foi possível atualizar o ${moduleLabels.singular.toLowerCase()}.`
                )
              );
            });
          return;
        }

        const { _isDuplicate, ...clean } = validatedData;
        const pendingId = `pending-${crypto.randomUUID()}`;
        const optimistic = { ...clean, id: pendingId };
        const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["cadcps-campos"] });

        patchCamposCache(queryClient, (previous) => ({
          ...previous,
          items: [optimistic, ...previous.items],
          total: previous.total + 1,
        }));
        stayOnRecordAfterSave(optimistic);
        toast.success(`${moduleLabels.singular} cadastrado!`);
        setFormVersion((version) => version + 1);

        void moduleRepository
          .create(clean)
          .then((savedRecord) => {
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
          })
          .catch((error) => {
            cacheSnapshot.forEach(([key, value]) => {
              queryClient.setQueryData(key, value);
            });
            patchCamposCache(queryClient, (previous) => ({
              ...previous,
              items: previous.items.filter((item) => item.id !== pendingId),
              total: Math.max(0, previous.total - 1),
            }));
            toast.error(
              resolveErrorMessage(
                error,
                `Não foi possível cadastrar o ${moduleLabels.singular.toLowerCase()}.`
              )
            );
          });
      } catch (error) {
        toast.error(
          resolveErrorMessage(
            error,
            isUpdate
              ? `Não foi possível atualizar o ${moduleLabels.singular.toLowerCase()}.`
              : `Não foi possível cadastrar o ${moduleLabels.singular.toLowerCase()}.`
          )
        );
      }
    },
    [editingItem, queryClient, stayOnRecordAfterSave]
  );

  const handleEdit = (item) => {
    const index = camposNavegacao.findIndex((entry) => entry.id === item.id);
    if (index >= 0) setSelectedIndex(index);
    setSelectedTableItems([item.id]);
    setEditingItem(item);
    setShowForm(true);
    setViewMode("record");
    setFormVersion((version) => version + 1);
  };

  const handleNew = () => {
    setReturnRecordAfterNew(
      showForm && viewMode === "record" ? editingItem || currentCampo : null
    );
    setEditingItem(null);
    setShowForm(true);
    setViewMode("record");
    setFormVersion((version) => version + 1);
  };

  const handleDuplicate = (item) => {
    setReturnRecordAfterNew(showForm && viewMode === "record" ? item : null);
    const { id, createdAt, updatedAt, codigo, ...dup } = item;
    setEditingItem({ ...dup, _isDuplicate: true });
    setShowForm(true);
    setViewMode("record");
    setFormVersion((version) => version + 1);
  };

  const handleRequestDelete = (ids) => {
    const normalized = (Array.isArray(ids) ? ids : [ids]).filter(Boolean);
    pendingDeleteIdsRef.current = normalized;
    setDeleteState({ open: true, ids: normalized });
  };

  const handleSearchChange = useCallback((value) => {
    setSearchTerm(value);
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

  const navigateRecord = (index) => {
    if (!showForm) return;
    const nextIndex = Math.min(Math.max(index, 0), Math.max(camposNavegacao.length - 1, 0));
    setSelectedIndex(nextIndex);
    if (camposNavegacao[nextIndex]) {
      setEditingItem(camposNavegacao[nextIndex]);
      setSelectedTableItems([camposNavegacao[nextIndex].id]);
    }
  };

  const handleConfirmDelete = async () => {
    const ids =
      pendingDeleteIdsRef.current.length > 0 ? pendingDeleteIdsRef.current : deleteState.ids;
    if (ids.length === 0) {
      toast.error("Nenhum registro selecionado para exclusão.");
      throw new Error("Nenhum registro selecionado para exclusão.");
    }

    const deletedCurrentFromForm =
      showForm && viewMode === "record" && editingItem?.id && ids.includes(editingItem.id);
    const navListBeforeDelete = camposNavegacao;
    const navIndexBeforeDelete = deletedCurrentFromForm
      ? navListBeforeDelete.findIndex((item) => item.id === editingItem.id)
      : -1;

    const cacheSnapshot = queryClient.getQueriesData({ queryKey: ["cadcps-campos"] });

    patchCamposCache(queryClient, (previous) => ({
      ...previous,
      items: previous.items.filter((item) => !ids.includes(item.id)),
      total: Math.max(0, previous.total - ids.length),
    }));

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

    try {
      await Promise.all(ids.map((id) => moduleRepository.remove(id)));
      toast.success(
        ids.length === 1
          ? `${moduleLabels.singular} excluído!`
          : `${ids.length} ${moduleLabels.plural.toLowerCase()} excluídos!`
      );
    } catch (error) {
      cacheSnapshot.forEach(([key, data]) => {
        queryClient.setQueryData(key, data);
      });
      toast.error(
        resolveErrorMessage(
          error,
          `Não foi possível excluir o ${moduleLabels.singular.toLowerCase()}.`
        )
      );
      throw error;
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
          total: camposNavegacao.length,
          currentIndex: selectedIndex,
          onNew: handleNew,
          onFirst: () => navigateRecord(0),
          onPrevious: () => navigateRecord(selectedIndex - 1),
          onNext: () => navigateRecord(selectedIndex + 1),
          onLast: () => navigateRecord(camposNavegacao.length - 1),
          onDelete: () => editingItem?.id && handleRequestDelete(editingItem.id),
          onDuplicate: () => editingItem && handleDuplicate(editingItem),
          searchValue: searchTerm,
          onSearchChange: handleSearchChange,
        }}
      />

      <CamposTablePanel
        hidden={showForm}
        toolbarProps={{
          viewMode,
          total: totalCampos,
          currentIndex: selectedIndex,
          searchValue: searchTerm,
          onSearchChange: handleSearchChange,
          onNew: handleNew,
          onToggleView: handleToggleView,
          toggleViewDisabled: selectedTableItems.length > 1,
          filterActive: false,
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
