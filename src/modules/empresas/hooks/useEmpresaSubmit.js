import { useCallback } from "react";
import { showSuccess, showError } from "@/shared/feedback";
import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { normalizeEmpresaRecord } from "@/modules/empresas/utils/empCodigoUtils";
import { patchEmpresasCache } from "@/modules/empresas/data/empresasListCache";
import { patchMetricsCache, setMetricsCache } from "@/apis/metrics/metricsCache";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import { isPendingRecordId } from "@/shared/utils/pendingRecordUtils";

/**
 * Persistência otimista de create/update na listagem Empresas.
 */
export function useEmpresaSubmit({
  editingEmp,
  empresasSelector,
  pendingAttachments,
  pendingCreatesRef,
  moduleRepository,
  moduleLabels,
  queryClient,
  saveCycle,
  resolveErrorMessage,
  stayOnRecordAfterSave,
  setEditingEmp,
  setFormVersion,
  setSelectedTableItems,
  upsertEmpresaInSelector,
  removeEmpresasFromSelector,
  replaceEmpresasInSelector,
  setPendingAttachments,
}) {
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

  const handleSubmit = useCallback(
    (data) => {
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
            setEditingEmp((current) => (current?.id === pendingId ? normalized : current));
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
    },
    [
      editingEmp,
      empresasSelector,
      moduleLabels,
      moduleRepository,
      pendingAttachments,
      pendingCreatesRef,
      persistPendingAttachments,
      queryClient,
      removeEmpresasFromSelector,
      replaceEmpresasInSelector,
      resolveErrorMessage,
      saveCycle,
      setEditingEmp,
      setFormVersion,
      setPendingAttachments,
      setSelectedTableItems,
      stayOnRecordAfterSave,
      upsertEmpresaInSelector,
    ]
  );

  return { handleSubmit, persistPendingAttachments };
}
