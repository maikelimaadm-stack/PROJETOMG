import { useMakRecordSubmit } from "@/framework/mak/records";
import { empresasMakRuntime } from "@/modules/empresas/config/empresasMakRuntime";

/** @deprecated Use useMakRecordSubmit — wrapper Empresas sobre MAK Foundation */
export function useEmpresaSubmit(props) {
  return useMakRecordSubmit({
    ...props,
    editingRecord: props.editingEmp,
    setEditingRecord: props.setEditingEmp,
    selectorSnapshot: props.empresasSelector,
    schema: empresasMakRuntime.schema,
    normalizeRecord: empresasMakRuntime.normalizeRecord,
    listQueryKey: empresasMakRuntime.listQueryKey,
    patchListCache: empresasMakRuntime.patchListCache,
    entityName: empresasMakRuntime.entityName,
    metricsEntityKey: empresasMakRuntime.metricsEntityKey,
    upsertInSelector: props.upsertEmpresaInSelector,
    removeFromSelector: props.removeEmpresasFromSelector,
    replaceInSelector: props.replaceEmpresasInSelector,
    attachmentPersistErrorMessage: empresasMakRuntime.attachmentPersistErrorMessage,
  });
}
