/**
 * Configuração completa do cadastro Empresas para o ModeloBase1.
 * Empresas = apenas configuração; o motor está em ModeloBase1/render.
 */
import { useAuth } from "@/shared/contexts/AuthContext";
import { defineModeloBase1Config } from "@/ModeloBase1/config/defineModeloBase1Config.js";
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
import { EmpConfiguracaoFiltrosDialog } from "@/modules/empresas/config/modeloBase1/empresasFiltrosConfig.js";
import { empresasToolbarComponents } from "@/modules/empresas/config/modeloBase1/empresasToolbarConfig.js";
import { empresasLayoutConfig } from "@/modules/empresas/config/modeloBase1/empresasLayoutConfig.js";
import { EMP_SORT_KEY } from "@/modules/empresas/config/modeloBase1/empresasTabelaConfig.js";
import {
  readStoredTempListagemFilters,
  writeStoredTempListagemFilters,
  useEmpresasPreferencesBootstrapState,
  isEmpPreferencesSectionDirty,
  isRemoteTabPreferenceEvent,
  subscribeEmpPreferencesCache,
  readEmpPreferencesJson,
  writeEmpPreferencesText,
} from "@/modules/empresas/config/modeloBase1/empresasPreferenciasConfig.js";
import {
  useEmpSearchDropdownFields,
  useEmpFavorites,
  useEmpresasInfiniteData,
} from "@/modules/empresas/config/modeloBase1/empresasEventosConfig.js";
import {
  useEmpViewModePreference,
  useEmpCardsVisFields,
  getFieldsPerRowForLayout,
} from "@/modules/empresas/config/modeloBase1/empresasLayoutConfig.js";
import {
  useEmpFilterFieldsLayout,
  useEmpCamposPersonalizados,
} from "@/modules/empresas/config/modeloBase1/empresasFiltrosConfig.js";
import { empresasDataConfig, empresasPreferencesAdapter } from "@/modules/empresas/config/modeloBase1/empresasSearchViewConfig.js";

const readInitialQuerySort = () => {
  const storedSort = readEmpPreferencesJson(EMP_SORT_KEY, null);
  const primarySort = Array.isArray(storedSort)
    ? storedSort.find((item) => item?.key)
    : storedSort?.key
      ? storedSort
      : null;
  if (primarySort?.key) {
    return {
      key: primarySort.key,
      direction: primarySort.direction === "desc" ? "desc" : "asc",
    };
  }
  return { key: "codempresa", direction: "asc" };
};

const readInitialColumnFiltersState = () => {
  const stored = readStoredTempListagemFilters();
  if (stored && typeof stored === "object" && !Array.isArray(stored)) {
    return stored;
  }
  return {};
};

export const empresasModeloBase1Config = defineModeloBase1Config({
  moduleId: "empresas",
  makModule: empresasMakModule,
  moduleDefinition: empresasModuleDefinition,
  scopeCssClass: empresasLayoutConfig.scopeCssClass,
  listMode: empresasLayoutConfig.listMode,
  metricsCounterKey: "empresas",
  dropdownQueryKeyPrefix: "emp-cadastro-dropdown",
  tableKey: "tbl-emp",
  preferencesAdapter: empresasPreferencesAdapter,

  labels: {
    singular: empresasModuleDefinition.singularLabel,
    plural: empresasModuleDefinition.pluralLabel,
    title: `Cadastro de ${empresasModuleDefinition.pluralLabel}`,
    newRecord: "Nova Empresa",
    duplicateRecord: "Duplicar empresa",
  },

  components: {
    ...empresasToolbarComponents,
    FilterFieldsConfigDialog: EmpConfiguracaoFiltrosDialog,
  },

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
    useViewModePreference: useEmpViewModePreference,
    useCardsVisFields: useEmpCardsVisFields,
    useSearchDropdownFields: useEmpSearchDropdownFields,
    useFavorites: useEmpFavorites,
    useInfiniteListData: useEmpresasInfiniteData,
    useCustomFields: useEmpCamposPersonalizados,
    useFilterFieldsLayout: useEmpFilterFieldsLayout,
  },

  data: {
    ...empresasDataConfig,
    patchListCache: patchEmpresasCache,
  },

  helpers: {
    readInitialQuerySort,
    readInitialColumnFiltersState,
    readStoredTempListagemFilters,
    writeStoredTempListagemFilters,
    isPreferencesSectionDirty: isEmpPreferencesSectionDirty,
    isRemoteTabPreferenceEvent,
    subscribePreferencesCache: subscribeEmpPreferencesCache,
    readPreferencesJson: readEmpPreferencesJson,
    writePreferencesText: writeEmpPreferencesText,
    getFieldsPerRowForLayout,
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
