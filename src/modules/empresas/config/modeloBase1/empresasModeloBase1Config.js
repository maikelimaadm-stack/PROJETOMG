/**
 * Configuração Empresas — consumidor exclusivo via buildModeloBase1ConfigFromMakModule.
 */
import { useAuth } from "@/shared/contexts/AuthContext";
import { buildModeloBase1ConfigFromMakModule } from "@/ModeloBase1/config/buildModeloBase1ConfigFromMakModule.js";
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";
import { empresasModuleDefinition } from "@/modules/empresas/config/moduleDefinition";
import { empresasMakModule } from "@/modules/empresas/config/empresasMakModule";
import { findEmpresaInList, normalizeEmpresaRecord } from "@/modules/empresas/utils/empCodigoUtils";
import { buildEmpresaExportRows } from "@/modules/empresas/utils/empExportRows";
import {
  getEmpPdfExportConfig,
  getEmpExcelExportConfig,
  saveEmpExcelExportConfig,
  saveEmpPdfExportConfig,
} from "@/modules/empresas/config/empPdfExportConfig";
import { patchEmpresasCache } from "@/modules/empresas/data/empresasListCache";
import { empresasToolbarComponents } from "@/modules/empresas/config/modeloBase1/empresasToolbarConfig.js";
import { useEmpresasPreferencesBootstrapState } from "@/modules/empresas/preferences/EmpresasPreferencesBootstrapContext";
import {
  empresasDataConfig,
  empresasPreferencesAdapter,
  empresasSearchViewConfig,
  empresasCustomFieldsConfig,
} from "@/modules/empresas/config/modeloBase1/empresasSearchViewConfig.js";

export const empresasModeloBase1Config = buildModeloBase1ConfigFromMakModule(empresasMakModule, {
  scopeCssClass: buildModeloBase1ScopeCssClass("empresas"),
  tableKey: "tbl-emp",
  metricsCounterKey: "empresas",
  dropdownQueryKeyPrefix: "emp-cadastro-dropdown",
  preferencesAdapter: empresasPreferencesAdapter,
  searchView: empresasSearchViewConfig,
  customFields: empresasCustomFieldsConfig,
  moduleDefinition: empresasModuleDefinition,
  labels: {
    singular: empresasModuleDefinition.singularLabel,
    plural: empresasModuleDefinition.pluralLabel,
    title: `Cadastro de ${empresasModuleDefinition.pluralLabel}`,
    newRecord: "Nova Empresa",
    duplicateRecord: "Duplicar empresa",
  },
  components: empresasToolbarComponents,
  hooks: {
    useScopeAuth: () => {
      const {
        empresas: selectorSnapshot,
        selectedEmpresaId: selectedScopeId,
        upsertEmpresaInSelector: upsertInSelector,
        removeEmpresasFromSelector: removeFromSelector,
        replaceEmpresasInSelector: replaceInSelector,
      } = useAuth();
      return {
        selectorSnapshot,
        selectedScopeId,
        upsertInSelector,
        removeFromSelector,
        replaceInSelector,
      };
    },
    usePreferencesBootstrap: useEmpresasPreferencesBootstrapState,
  },
  data: {
    ...empresasDataConfig,
    patchListCache: patchEmpresasCache,
  },
  helpers: {
    findRecordInList: findEmpresaInList,
    normalizeRecord: normalizeEmpresaRecord,
    buildExportRows: buildEmpresaExportRows,
    buildDuplicateRecord: (record) => {
      const {
        id,
        created_date,
        updated_date,
        created_by,
        codempresa,
        id_global,
        _isPersisting,
        ...dup
      } = record;
      return { ...dup, _isDuplicate: true };
    },
    getRecordCode: (record) =>
      record?.codempresa != null ? String(record.codempresa).padStart(6, "0") : "",
    getRecordTitle: (record, labels, formBridge, context = {}) => {
      if (formBridge?.recordMeta?.nome) return formBridge.recordMeta.nome;
      if (context.isNew) return labels?.newRecord ?? "Nova Empresa";
      if (context.isDuplicating) return labels?.duplicateRecord ?? "Duplicar empresa";
      return (
        record?.razao_social ||
        record?.nome_empresa ||
        labels?.singular ||
        "Novo registro"
      );
    },
    getAttachmentTitle: (record) => record?.razao_social || record?.codempresa || "",
    matchRecordIdentity: (item, record) =>
      item.id === record?.id ||
      (record?.codempresa != null &&
        Number(item.codempresa) === Number(record.codempresa)),
  },
  export: {
    getPdfExportConfig: getEmpPdfExportConfig,
    getExcelExportConfig: getEmpExcelExportConfig,
    savePdfExportConfig: saveEmpPdfExportConfig,
    saveExcelExportConfig: saveEmpExcelExportConfig,
  },
});

export default empresasModeloBase1Config;
