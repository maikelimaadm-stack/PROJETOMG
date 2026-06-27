import { createMakModulePreferencesAdapter } from "./createMakModulePreferencesAdapter.js";
import { createMakModulePreferencesScopeState } from "./createMakModulePreferencesScopeState.js";
import { createMakStandardListagemPreferencesStorage } from "./createMakStandardListagemPreferencesStorage.js";
import { createMakModulePreferencesBootstrapHook } from "./createMakModulePreferencesBootstrapHook.js";
import { buildMakPreferencesBootstrapAppliedEvent } from "./makModulePreferencesBootstrapEvents.js";

/**
 * Factory completa de bootstrap + storage + adapter para módulos certificados padrão.
 */
export function createMakStandardModulePreferencesBootstrap({
  moduleId,
  keyPrefix,
  tableMetadata = {},
  searchMetadata = {},
  defaultSort = null,
  loadBatchStorageKey = null,
}) {
  const scopeState = createMakModulePreferencesScopeState(moduleId);
  const adapter = createMakModulePreferencesAdapter({
    moduleId,
    keyPrefix,
    bootstrapAppliedEvent: buildMakPreferencesBootstrapAppliedEvent(moduleId),
    isSectionDirty: (section) => scopeState.isSectionDirty(section),
  });

  const storage = createMakStandardListagemPreferencesStorage({
    moduleId,
    keyPrefix,
    adapter,
    scopeState,
    tablePreferenceKeys: tableMetadata.preferenceKeys ?? {},
    searchStorageKeys: searchMetadata.storageKeys ?? {},
    defaultSort: defaultSort ?? tableMetadata.defaultSort ?? { key: "codigo", direction: "asc" },
    loadBatchStorageKey,
  });

  const useBootstrapHook = createMakModulePreferencesBootstrapHook({
    moduleId,
    storage,
    scopeState,
  });

  return {
    moduleId,
    adapter,
    storage,
    scopeState,
    useBootstrapHook,
  };
}

export default createMakStandardModulePreferencesBootstrap;
