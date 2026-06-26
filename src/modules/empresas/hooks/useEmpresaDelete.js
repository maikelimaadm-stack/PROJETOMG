import { useMakRecordDelete } from "@/framework/mak/records";
import { empresasMakRuntime } from "@/modules/empresas/config/empresasMakRuntime";

/** @deprecated Use useMakRecordDelete — wrapper Empresas sobre MAK Foundation */
export function useEmpresaDelete(props) {
  return useMakRecordDelete({
    ...props,
    editingRecord: props.editingEmp,
    setEditingRecord: props.setEditingEmp,
    selectorState: props.empresasSelector,
    navigationList: props.empresasNavegacao,
    findRecordInList: empresasMakRuntime.findRecordInList,
    listQueryKey: empresasMakRuntime.listQueryKey,
    patchListCache: empresasMakRuntime.patchListCache,
    metricsEntityKey: empresasMakRuntime.metricsEntityKey,
    removeFromSelector: props.removeEmpresasFromSelector,
    replaceInSelector: props.replaceEmpresasInSelector,
  });
}
