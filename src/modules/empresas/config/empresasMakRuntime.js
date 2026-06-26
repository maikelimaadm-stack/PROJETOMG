import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { findEmpresaInList, normalizeEmpresaRecord } from "@/modules/empresas/utils/empCodigoUtils";
import { buildEmpresaExportRows } from "@/modules/empresas/utils/empExportRows";
import { getEmpPdfExportConfig } from "@/modules/empresas/config/empPdfExportConfig";
import {
  EMPRESAS_LIST_QUERY_KEY,
  patchEmpresasCache,
} from "@/modules/empresas/data/empresasListCache";

/** Configuração Empresas injetada na MAK Foundation — módulo é consumidor. */
export const empresasMakRuntime = Object.freeze({
  moduleId: "empresas",
  moduleDefinition: empresasModuleDefinition,
  moduleLabels: {
    singular: empresasModuleDefinition.singularLabel,
    plural: empresasModuleDefinition.pluralLabel,
    title: `Cadastro de ${empresasModuleDefinition.pluralLabel}`,
  },
  listQueryKey: EMPRESAS_LIST_QUERY_KEY,
  metricsEntityKey: "empresas",
  entityName: empresasModuleDefinition.entityName,
  schema: empresasModuleDefinition.schema,
  normalizeRecord: normalizeEmpresaRecord,
  findRecordInList: findEmpresaInList,
  patchListCache: patchEmpresasCache,
  getPdfExportConfig: getEmpPdfExportConfig,
  buildExportRows: buildEmpresaExportRows,
  attachmentPersistErrorMessage: "Empresa cadastrada, mas alguns anexos não puderam ser salvos.",
});
