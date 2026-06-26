import { useMakRecordExport } from "@/framework/mak/records";
import { empresasMakRuntime } from "@/modules/empresas/config/empresasMakRuntime";

/** @deprecated Use useMakRecordExport — wrapper Empresas sobre MAK Foundation */
export function useEmpresaExport(props) {
  return useMakRecordExport({
    ...props,
    getPdfExportConfig: empresasMakRuntime.getPdfExportConfig,
    buildExportRows: empresasMakRuntime.buildExportRows,
  });
}
