export {
  PREFERENCES_CACHE_UPDATED_EVENT,
  LEGACY_PREFERENCES_CACHE_UPDATED_EVENT,
  EMP_PREFERENCES_CACHE_UPDATED_EVENT,
  configurePreferencesCacheHooks,
  resetPreferencesCacheHooks,
  resolvePreferenceStorageKey,
  resetPreferencesMemoryCache,
  withPreferencesCacheBatch,
  readPreferencesText,
  readPreferencesJson,
  writePreferencesText,
  writePreferencesJson,
  removePreferencesKey,
  hasScopedPreferenceValue,
  subscribePreferencesCache,
  emitPreferencesCacheUpdate,
  isLocalListagemPreferenceWrite,
  isSameTabPreferencesWrite,
} from "./userPreferencesCache.js";

export {
  MakPreferencesBootstrapProvider,
  useMakPreferencesBootstrapState,
} from "./PreferencesBootstrapProvider.jsx";

export {
  registerMakPreferencesBootstrapModule,
  getMakPreferencesBootstrapHook,
  listMakPreferencesBootstrapModuleIds,
} from "./bootstrapRegistry.js";

export { useMakPreferencesBootstrapAggregator } from "./useMakPreferencesBootstrapAggregator.js";
export { createMakPreferencesEngine } from "./MakPreferencesEngine.js";
export { createMakPreferencesScope } from "./createMakPreferencesScope.js";
