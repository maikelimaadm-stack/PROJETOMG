/**
 * Módulo Empresas — configuração declarativa via defineMakModule().
 * Substitui empresasMakRuntime (runtime específico por módulo proibido na V6).
 */
import { defineMakModule } from "@/framework/mak/runtime";
import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { empresasModuleMetadata } from "@/modules/empresas/config/empresasModuleMetadata";
import { empresasPreferencesAdapter } from "@/modules/empresas/config/empresasPreferencesAdapter";
import { findEmpresaInList, normalizeEmpresaRecord } from "@/modules/empresas/utils/empCodigoUtils";
import { buildEmpresaExportRows } from "@/modules/empresas/utils/empExportRows";
import { getEmpPdfExportConfig } from "@/modules/empresas/config/empPdfExportConfig";
import {
  EMPRESAS_LIST_QUERY_KEY,
  patchEmpresasCache,
} from "@/modules/empresas/data/empresasListCache";
import MakCadastroSearchPanel from "@/ModeloBase1/search/MakCadastroSearchPanel.jsx";
import MakLoadBatchControls from "@/ModeloBase1/components/MakLoadBatchControls.jsx";
import empRepository from "@/modules/empresas/repositories/empRepository";
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig";

export const empresasMakModule = defineMakModule(
  empresasModuleDefinition,
  empresasModuleMetadata,
  {
    listQueryKey: EMPRESAS_LIST_QUERY_KEY,
    patchListCache: patchEmpresasCache,
    metricsEntityKey: "empresas",
    normalizeRecord: normalizeEmpresaRecord,
    findRecordInList: findEmpresaInList,
    getPdfExportConfig: getEmpPdfExportConfig,
    buildExportRows: buildEmpresaExportRows,
    attachmentPersistErrorMessage: "Empresa cadastrada, mas alguns anexos não puderam ser salvos.",
    repository: empRepository,
    cadastroConfig: empresasCadastroConfig,
    components: {
      LoadBatchControls: MakLoadBatchControls,
      SearchPanel: MakCadastroSearchPanel,
    },
  },
  empresasPreferencesAdapter,
);

/** @deprecated use empresasMakModule — alias de compatibilidade V5 */
export const empresasMakRuntime = Object.freeze({
  ...empresasMakModule,
  moduleLabels: empresasMakModule.labels,
  moduleDefinition: empresasMakModule.definition,
});
