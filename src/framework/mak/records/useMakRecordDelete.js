import { useCallback } from "react";
import { showSuccess, showError } from "@/shared/feedback";
import { patchMetricsCache, setMetricsCache } from "@/apis/metrics/metricsCache";
import { isPendingRecordId } from "@/shared/utils/pendingRecordUtils";

/**
 * Exclusão otimista com rollback — infraestrutura MAK reutilizável por módulo.
 */
export function useMakRecordDelete({
  deleteState,
  setDeleteState,
  pendingDeleteIdsRef,
  pendingCreatesRef,
  moduleRepository,
  moduleLabels,
  listQueryKey,
  patchListCache,
  metricsEntityKey,
  queryClient,
  saveCycle,
  resolveErrorMessage,
  showForm,
  viewMode,
  editingRecord,
  selectorState,
  navigationList,
  attachmentsRecord,
  selectedTableItems,
  findRecordInList,
  refreshNavRecord,
  removeFromSelector,
  replaceInSelector,
  setShowForm,
  setEditingRecord,
  setViewMode,
  setSelectedTableItems,
  setSelectedIndex,
  setFormVersion,
  setAttachmentsRecord,
  setAttachmentsOpen,
}) {
  const handleConfirmDelete = useCallback(async () => {
    const ids =
      pendingDeleteIdsRef.current.length > 0 ? pendingDeleteIdsRef.current : deleteState.ids;
    if (ids.length === 0) {
      showError("Nenhum registro selecionado para exclusão.");
      throw new Error("Nenhum registro selecionado para exclusão.");
    }

    saveCycle.beginDelete();

    const wasOnForm = showForm && viewMode === "record";
    const deletedCurrentFromForm =
      wasOnForm && editingRecord?.id && ids.includes(editingRecord.id);
    const navListBeforeDelete = navigationList;
    const navIndexBeforeDelete = deletedCurrentFromForm
      ? navListBeforeDelete.findIndex((item) => item.id === editingRecord.id)
      : -1;

    const cacheSnapshot = queryClient.getQueriesData({ queryKey: listQueryKey });
    const metricsSnapshot = queryClient.getQueryData(["metrics-contadores"]);
    const selectorSnapshot = selectorState;

    patchListCache(queryClient, (previous) => ({
      ...previous,
      items: previous.items.filter((item) => !ids.includes(item.id)),
      total: Math.max(0, previous.total - ids.length),
    }));
    if (metricsEntityKey) {
      patchMetricsCache(queryClient, { [metricsEntityKey]: -ids.length });
    }
    removeFromSelector(ids);

    const list = navListBeforeDelete.filter((item) => !ids.includes(item.id));

    if (attachmentsRecord?.id && ids.includes(attachmentsRecord.id)) {
      setAttachmentsRecord(null);
      setAttachmentsOpen(false);
    }

    if (deletedCurrentFromForm) {
      const remainingNav = navListBeforeDelete
        .filter((item) => !ids.includes(item.id))
        .map((item) => findRecordInList(list, item))
        .filter(Boolean);

      if (remainingNav.length === 0) {
        setShowForm(false);
        setEditingRecord(null);
        setViewMode("table");
        setSelectedTableItems([]);
        setSelectedIndex(0);
      } else {
        const nextIndex = Math.min(Math.max(navIndexBeforeDelete, 0), remainingNav.length - 1);
        const nextRecord = remainingNav[nextIndex];
        setEditingRecord(nextRecord);
        setSelectedIndex(nextIndex);
        setSelectedTableItems([nextRecord.id]);
        setShowForm(true);
        setViewMode("record");
      }
    } else {
      const remainingNav = navListBeforeDelete
        .filter((item) => !ids.includes(item.id))
        .map((item) => findRecordInList(list, item))
        .filter(Boolean);

      setSelectedTableItems((prev) => prev.filter((id) => !ids.includes(id)));

      if (
        showForm &&
        viewMode === "record" &&
        editingRecord?.id &&
        !ids.includes(editingRecord.id)
      ) {
        const { fresh, navIndex } = refreshNavRecord(list, editingRecord, remainingNav);
        if (fresh) {
          setEditingRecord(fresh);
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

      if (wasOnForm && viewMode === "record" && !editingRecord?.id && !editingRecord?._isDuplicate) {
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
      replaceInSelector(selectorSnapshot);
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
  }, [
    attachmentsRecord,
    deleteState.ids,
    editingRecord,
    findRecordInList,
    listQueryKey,
    metricsEntityKey,
    moduleLabels,
    moduleRepository,
    navigationList,
    patchListCache,
    pendingCreatesRef,
    pendingDeleteIdsRef,
    queryClient,
    refreshNavRecord,
    removeFromSelector,
    replaceInSelector,
    resolveErrorMessage,
    saveCycle,
    selectedTableItems,
    selectorState,
    setAttachmentsOpen,
    setAttachmentsRecord,
    setDeleteState,
    setEditingRecord,
    setFormVersion,
    setSelectedIndex,
    setSelectedTableItems,
    setShowForm,
    setViewMode,
    showForm,
    viewMode,
  ]);

  return { handleConfirmDelete };
}
