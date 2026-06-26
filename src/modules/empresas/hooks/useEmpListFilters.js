import { useMakListFilters } from "@/framework/mak/listing/useMakListFilters";
import { empresasMakRuntime } from "@/modules/empresas/config/empresasMakRuntime";

/** Wrapper Empresas — preferir useMakListFilters com moduleId. */
export function useEmpListFilters(props) {
  return useMakListFilters({
    moduleId: empresasMakRuntime.moduleId,
    ...props,
  });
}
