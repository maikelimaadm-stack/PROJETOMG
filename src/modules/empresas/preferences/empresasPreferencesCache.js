import { getEmpPreferencesTabId } from "@/modules/empresas/preferences/empresasPreferencesCrossTab.js";
import { trackEmpPreferencesWriteReason } from "@/modules/empresas/preferences/empresasPreferencesScopeState.js";
import { createMakPreferencesScope } from "@/framework/mak/preferences/createMakPreferencesScope.js";
import {
  emitPreferencesCacheUpdate,
  hasScopedPreferenceValue,
  isLocalListagemPreferenceWrite,
  isSameTabPreferencesWrite,
  PREFERENCES_CACHE_UPDATED_EVENT,
  readPreferencesJson,
  readPreferencesText,
  removePreferencesKey,
  resetPreferencesMemoryCache,
  subscribePreferencesCache,
  withPreferencesCacheBatch,
  writePreferencesJson,
  writePreferencesText,
} from "@/framework/mak/preferences/userPreferencesCache.js";

createMakPreferencesScope({
  getOriginTabId: getEmpPreferencesTabId,
  onPreferenceWrite: trackEmpPreferencesWriteReason,
});

export const resetEmpPreferencesMemoryCache = resetPreferencesMemoryCache;
export const withEmpPreferencesCacheBatch = withPreferencesCacheBatch;
export const readEmpPreferencesText = readPreferencesText;
export const readEmpPreferencesJson = readPreferencesJson;
export const writeEmpPreferencesText = writePreferencesText;
export const writeEmpPreferencesJson = writePreferencesJson;
export const removeEmpPreferencesKey = removePreferencesKey;
export { hasScopedPreferenceValue };
export const subscribeEmpPreferencesCache = subscribePreferencesCache;
export const emitEmpPreferencesCacheUpdate = emitPreferencesCacheUpdate;
export { isLocalListagemPreferenceWrite };
export const isSameTabEmpPreferencesWrite = isSameTabPreferencesWrite;
export const EMP_PREFERENCES_CACHE_UPDATED_EVENT = PREFERENCES_CACHE_UPDATED_EVENT;
export { LEGACY_PREFERENCES_CACHE_UPDATED_EVENT } from "@/framework/mak/preferences/userPreferencesCache.js";
