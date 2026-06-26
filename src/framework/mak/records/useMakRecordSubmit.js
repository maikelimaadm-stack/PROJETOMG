import { useCallback } from "react";
import { showSuccess, showError } from "@/shared/feedback";
import { patchMetricsCache, setMetricsCache } from "@/apis/metrics/metricsCache";
import { AnexosApi } from "@/apis/anexos/AnexosApi";
import { isPendingRecordId } from "@/shared/utils/pendingRecordUtils";

/**
 * Persistência otimista create/update — infraestrutura MAK reutilizável por módulo.
 */
export function useMakRecordSubmit({
  editingRecord,
  selectorSnapshot: selectorState,
  pendingAttachments,
  pendingCreatesRef,
  moduleRepository,
  moduleLabels,
  schema,
  normalizeRecord,
  listQueryKey,
  patchListCache,
  entityName,
  metricsEntityKey,
  queryClient,
  saveCycle,
  resolveErrorMessage,
  stayOnRecordAfterSave,
  setEditingRecord,
  setFormVersion,
  setSelectedTableItems,
  upsertInSelector,
  removeFromSelector,
  replaceInSelector,
  setPendingAttachments,
  attachmentPersistErrorMessage = "Registro cadastrado, mas alguns anexos não puderam ser salvos.",
}) {
  const persistPendingAttachments = useCallback(
    async (recordId, items) => {
      if (!recordId || !items?.length) return;

      await Promise.all(
        items.map((anexo) =>
          AnexosApi.create({
            entity_name: anexo.entity_name || entityName,
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
    },
    [entityName]
  );

  const handleSubmit = useCallback(
    (data) => {
      if (saveCycle.isSaving) return;

      const isUpdate = Boolean(
        editingRecord?.id && !isPendingRecordId(editingRecord.id) && !editingRecord._isDuplicate
      );

      try {
        const validatedData = schema.parse(data);
        saveCycle.beginSave();

        if (isUpdate) {
          const optimistic = normalizeRecord({ ...editingRecord, ...validatedData });
          const cacheSnapshot = queryClient.getQueriesData({ queryKey: listQueryKey });
          const selectorSnapshot = selectorState;

          patchListCache(queryClient, (previous) => ({
            ...previous,
            items: previous.items.map((item) =>
              item.id === editingRecord.id ? { ...item, ...optimistic } : item
            ),
          }));
          upsertInSelector(optimistic);
          setEditingRecord(optimistic);
          stayOnRecordAfterSave(optimistic);
          setFormVersion((version) => version + 1);

          void moduleRepository
            .update(editingRecord.id, validatedData)
            .then((savedRecord) => {
              const normalized = normalizeRecord(savedRecord);
              patchListCache(queryClient, (previous) => ({
                ...previous,
                items: previous.items.map((item) =>
                  item.id === editingRecord.id ? { ...item, ...normalized } : item
                ),
              }));
              setEditingRecord(normalized);
              upsertInSelector(normalized);
              showSuccess(`${moduleLabels.singular} atualizada!`);
            })
            .catch((error) => {
              cacheSnapshot.forEach(([key, value]) => {
                queryClient.setQueryData(key, value);
              });
              replaceInSelector(selectorSnapshot);
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
        const optimistic = normalizeRecord({
          ...clean,
          id: pendingId,
          _isPersisting: true,
        });
        const cacheSnapshot = queryClient.getQueriesData({ queryKey: listQueryKey });
        const createEntry = { cancelled: false };
        pendingCreatesRef.current.set(pendingId, createEntry);

        patchListCache(queryClient, (previous) => ({
          ...previous,
          items: [optimistic, ...previous.items],
          total: previous.total + 1,
        }));
        if (metricsEntityKey) {
          patchMetricsCache(queryClient, { [metricsEntityKey]: 1, registrosGlobais: 1 });
        }
        stayOnRecordAfterSave(optimistic);
        setFormVersion((version) => version + 1);

        void moduleRepository
          .create(clean)
          .then(async (response) => {
            const normalized = normalizeRecord(response?.item);
            pendingCreatesRef.current.delete(pendingId);

            if (createEntry.cancelled) {
              try {
                const deleteResponse = await moduleRepository.delete(normalized.id);
                if (deleteResponse?.contadores) {
                  setMetricsCache(queryClient, deleteResponse.contadores);
                }
              } catch {
                // UI já removeu
              }
              return;
            }

            patchListCache(queryClient, (previous) => ({
              ...previous,
              items: previous.items.map((item) =>
                item.id === pendingId ? normalized : item
              ),
            }));
            setEditingRecord((current) => (current?.id === pendingId ? normalized : current));
            setSelectedTableItems((current) =>
              current.includes(pendingId) ? [normalized.id] : current
            );
            upsertInSelector(normalized);
            if (pendingAttachments.length > 0) {
              try {
                await persistPendingAttachments(normalized.id, pendingAttachments);
                setPendingAttachments([]);
              } catch {
                showError(attachmentPersistErrorMessage);
              }
            }
            setMetricsCache(queryClient, response?.contadores);
            showSuccess(`${moduleLabels.singular} cadastrada!`);
          })
          .catch((error) => {
            pendingCreatesRef.current.delete(pendingId);
            if (!createEntry.cancelled) {
              if (metricsEntityKey) {
                patchMetricsCache(queryClient, { [metricsEntityKey]: -1, registrosGlobais: -1 });
              }
              cacheSnapshot.forEach(([key, value]) => {
                queryClient.setQueryData(key, value);
              });
              patchListCache(queryClient, (previous) => ({
                ...previous,
                items: previous.items.filter((item) => item.id !== pendingId),
                total: Math.max(0, previous.total - 1),
              }));
              removeFromSelector([pendingId]);
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
      attachmentPersistErrorMessage,
      editingRecord,
      listQueryKey,
      metricsEntityKey,
      moduleLabels,
      moduleRepository,
      normalizeRecord,
      patchListCache,
      pendingAttachments,
      pendingCreatesRef,
      persistPendingAttachments,
      queryClient,
      removeFromSelector,
      replaceInSelector,
      resolveErrorMessage,
      saveCycle,
      schema,
      selectorState,
      setEditingRecord,
      setFormVersion,
      setPendingAttachments,
      setSelectedTableItems,
      stayOnRecordAfterSave,
      upsertInSelector,
    ]
  );

  return { handleSubmit, persistPendingAttachments };
}
