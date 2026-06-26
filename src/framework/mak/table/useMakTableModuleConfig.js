import { useMakModuleRequired } from "@/framework/mak/runtime/MakModuleContext.jsx";

/**
 * Config declarativa de tabela via runtime do módulo (sem imports Empresas na Foundation).
 */
export function useMakTableModuleConfig() {
  const module = useMakModuleRequired();
  const table = module.metadata?.table ?? {};
  const prefs = module.preferences;

  if (!prefs) {
    throw new Error("useMakTableModuleConfig: module.preferences engine is required");
  }

  const columns = table.columns ?? [];
  const constants = table.constants ?? {};
  const preferenceKeys = table.preferenceKeys ?? {};
  const filterHelpers = table.filterHelpers ?? {};
  const catalog = table.catalog ?? {};
  const hydration = table.hydration ?? {};
  const storage = table.storage ?? {};
  const useCustomFieldsHook = table.useCustomFieldsHook ?? (() => ({ campos: [], isLoading: false }));
  const LoadBatchControls = module.components?.LoadBatchControls ?? null;

  return {
    moduleId: module.moduleId,
    columns,
    COLUNAS_BASE: columns,
    constants,
    preferenceKeys,
    filterHelpers,
    catalog,
    hydration,
    storage,
    prefs,
    useCustomFieldsHook,
    LoadBatchControls,
    defaultSort: table.defaultSort ?? { key: "id", direction: "asc" },
    emitCacheUpdate: table.emitCacheUpdate ?? (() => {}),
    readJson: prefs.readJson.bind(prefs),
    readText: prefs.readText.bind(prefs),
    writeJson: prefs.writeJson.bind(prefs),
    writeText: prefs.writeText.bind(prefs),
    removeKey: prefs.removeKey.bind(prefs),
    subscribe: prefs.subscribe.bind(prefs),
    isSectionDirty: prefs.isSectionDirty.bind(prefs),
    bootstrapAppliedEvent: prefs.bootstrapAppliedEvent,
    markPerf: prefs.markPerf.bind(prefs),
    ...preferenceKeys,
    ...constants,
    ...filterHelpers,
    readTablePreferencesSnapshot: hydration.readTablePreferencesSnapshot,
    buildColumnSizingModeFromAutoFit: hydration.buildColumnSizingModeFromAutoFit,
    mergeColumnSizingMode: hydration.mergeColumnSizingMode,
    loadSavedVisibleColumns: catalog.loadSavedVisibleColumns,
    mergeEffectiveColumnLayout: catalog.mergeEffectiveColumnLayout,
    buildColumnCatalog: catalog.buildColumnCatalog,
    readStoredFilterOperators: storage.readStoredFilterOperators,
    writeStoredFilterOperators: storage.writeStoredFilterOperators,
    writeStoredTempListagemFilters: storage.writeStoredTempListagemFilters,
  };
}
