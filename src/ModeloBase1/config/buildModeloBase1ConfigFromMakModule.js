/**
 * Factory para config ModeloBase1 a partir de um makModule — motor infinite promovido.
 */
import { defineModeloBase1Config } from "./defineModeloBase1Config.js";
import { buildSearchViewFromMakModule } from "./buildSearchViewFromMakModule.js";
import { buildModeloBase1HelpersFromMakModule } from "./buildModeloBase1HelpersFromMakModule.js";
import { buildModeloBase1ScopeCssClass } from "@/ModeloBase1/layout/modeloBase1ScopeCss.js";
import {
  useModeloBase1InfiniteListData,
  useModeloBase1Favorites,
  useModeloBase1ViewModePreference,
  useModeloBase1PreferencesBootstrap,
  useModeloBase1SearchDropdownFields,
  useModeloBase1CardsVisFields,
  useModeloBase1FilterFieldsLayout,
  useModeloBase1CustomFields,
} from "@/ModeloBase1/hooks";
import {
  MakFormPanel,
  MakTablePanel,
  MakSearchPanel,
} from "@/framework/mak/page/MakCadastroPage.jsx";
import { ModeloBase1ExtraDialogs } from "@/ModeloBase1/render/ModeloBase1PanelSections.jsx";
import MakFilterFieldsConfigDialog from "@/ModeloBase1/dialogs/MakFilterFieldsConfigDialog.jsx";
import { MAK_LOAD_BATCH_OPTIONS } from "@/ModeloBase1/components/MakLoadBatchControls.jsx";

const noopScopeAuth = () => ({
  selectorSnapshot: [],
  selectedScopeId: null,
  upsertInSelector: () => {},
  removeFromSelector: () => {},
  replaceInSelector: () => {},
});

const DEFAULT_MAX_LOADED_ROWS = Math.max(
  1000,
  Number(import.meta.env.VITE_MAK_MAX_LOADED_ROWS || import.meta.env.VITE_EMP_MAX_LOADED_ROWS) ||
    10000
);

export function buildModeloBase1ConfigFromMakModule(makModule, overrides = {}) {
  const moduleDefinition = makModule.moduleDefinition ?? makModule.definition;
  const labels = overrides.labels ?? {
    singular: moduleDefinition?.singularLabel ?? makModule.labels?.singular ?? "Registro",
    plural: moduleDefinition?.pluralLabel ?? makModule.labels?.plural ?? "Registros",
    title:
      overrides.title ??
      `Cadastro de ${moduleDefinition?.pluralLabel ?? makModule.labels?.plural ?? "Registros"}`,
    newRecord: overrides.newRecord ?? `Novo ${moduleDefinition?.singularLabel ?? "Registro"}`,
    duplicateRecord:
      overrides.duplicateRecord ??
      `Duplicar ${moduleDefinition?.singularLabel?.toLowerCase() ?? "registro"}`,
  };

  const defaultPageSize = makModule.metadata?.list?.defaultPageSize ?? 100;
  const searchView = overrides.searchView ?? buildSearchViewFromMakModule(makModule);
  const defaultHelpers = buildModeloBase1HelpersFromMakModule(makModule);
  const keyPrefix = makModule.preferencesAdapter?.keyPrefix ?? makModule.moduleId;
  const moduleId = makModule.moduleId;

  return defineModeloBase1Config({
    moduleId,
    makModule,
    moduleDefinition,
    listMode: "infinite",
    scopeCssClass: overrides.scopeCssClass ?? buildModeloBase1ScopeCssClass(moduleId),
    tableKey: overrides.tableKey ?? `tbl-${moduleId}`,
    metricsCounterKey: overrides.metricsCounterKey ?? makModule.metricsEntityKey ?? moduleId,
    dropdownQueryKeyPrefix:
      overrides.dropdownQueryKeyPrefix ?? `${keyPrefix}-cadastro-dropdown`,
    preferencesAdapter: makModule.preferencesAdapter,
    searchView,
    labels,
    components: {
      FormPanel: MakFormPanel,
      TablePanel: MakTablePanel,
      SearchPanel: MakSearchPanel,
      Dialogs: ModeloBase1ExtraDialogs,
      FilterFieldsConfigDialog: overrides.components?.FilterFieldsConfigDialog ?? MakFilterFieldsConfigDialog,
      ...(overrides.components ?? {}),
    },
    hooks: {
      useScopeAuth: overrides.hooks?.useScopeAuth ?? noopScopeAuth,
      usePreferencesBootstrap: useModeloBase1PreferencesBootstrap,
      useViewModePreference: useModeloBase1ViewModePreference,
      useCardsVisFields: useModeloBase1CardsVisFields,
      useSearchDropdownFields: useModeloBase1SearchDropdownFields,
      useFavorites: useModeloBase1Favorites,
      useInfiniteListData: useModeloBase1InfiniteListData,
      useCustomFields: useModeloBase1CustomFields,
      useFilterFieldsLayout: useModeloBase1FilterFieldsLayout,
      ...(overrides.hooks ?? {}),
    },
    helpers: {
      ...defaultHelpers,
      ...(overrides.helpers ?? {}),
    },
    data: {
      listQueryKey: makModule.listQueryKey ?? [`${moduleId}-cadastro`],
      infinitePageSize: defaultPageSize,
      maxLoadedRows: DEFAULT_MAX_LOADED_ROWS,
      loadBatchOptions: MAK_LOAD_BATCH_OPTIONS,
      loadBatchStorageKey: `${keyPrefix}_infinite_batch_size`,
      readStoredLoadBatchSize: (fallback = MAK_LOAD_BATCH_OPTIONS[0]) => {
        const saved = Number(
          makModule.preferencesAdapter?.readText?.(`${keyPrefix}_infinite_batch_size`, null)
        );
        return Number.isFinite(saved) && saved > 0 ? saved : fallback;
      },
      patchListCache: makModule.patchListCache,
      ...(overrides.data ?? {}),
    },
    export: {
      getPdfExportConfig: makModule.getPdfExportConfig ?? (() => ({ useConfiguredColumns: false, columnIds: [] })),
      getExcelExportConfig: makModule.getExcelExportConfig ?? (() => ({})),
      savePdfExportConfig: makModule.savePdfExportConfig ?? (() => {}),
      saveExcelExportConfig: makModule.saveExcelExportConfig ?? (() => {}),
      ...(overrides.export ?? {}),
    },
    ...overrides,
  });
}

export default buildModeloBase1ConfigFromMakModule;
