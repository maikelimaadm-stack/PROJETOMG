import { useCallback } from "react";
import { showSuccess, showError } from "@/shared/feedback";
import { findEmpresaInList } from "@/modules/empresas/utils/empCodigoUtils";
import { patchEmpresasCache } from "@/modules/empresas/data/empresasListCache";
import { patchMetricsCache, setMetricsCache } from "@/apis/metrics/metricsCache";
import { isPendingRecordId } from "@/shared/utils/pendingRecordUtils";

/**
 * Exclusão otimista com rollback na listagem Empresas.
 */
export function useEmpresaDelete({
  deleteState,
  setDeleteState,
  pendingDeleteIdsRef,
  pendingCreatesRef,
  moduleRepository,
  moduleLabels,
  queryClient,
  saveCycle,
  resolveErrorMessage,
  showForm,
  viewMode,
  editingEmp,
  empresasSelector,
  empresasNavegacao,
  attachmentsRecord,
  selectedTableItems,
  refreshNavRecord,
  removeEmpresasFromSelector,
  replaceEmpresasInSelector,
  setShowForm,
  setEditingEmp,
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
  }, [
    attachmentsRecord,
    deleteState.ids,
    editingEmp,
    empresasNavegacao,
    empresasSelector,
    moduleLabels,
    moduleRepository,
    pendingCreatesRef,
    pendingDeleteIdsRef,
    queryClient,
    refreshNavRecord,
    removeEmpresasFromSelector,
    replaceEmpresasInSelector,
    resolveErrorMessage,
    saveCycle,
    selectedTableItems,
    setAttachmentsOpen,
    setAttachmentsRecord,
    setDeleteState,
    setEditingEmp,
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
