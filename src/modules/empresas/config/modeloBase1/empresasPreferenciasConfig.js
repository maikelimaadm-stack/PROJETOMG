/**
 * Empresas — preferências (bootstrap, storage, cache, cross-tab).
 */
export { useEmpresasPreferencesBootstrapState } from "@/modules/empresas/preferences/EmpresasPreferencesBootstrapContext";
export {
  readStoredTempListagemFilters,
  writeStoredTempListagemFilters,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";
export { isEmpPreferencesSectionDirty } from "@/modules/empresas/preferences/empresasPreferencesScopeState";
export { isRemoteTabPreferenceEvent } from "@/modules/empresas/preferences/empresasPreferencesCrossTab";
export {
  subscribeEmpPreferencesCache,
  readEmpPreferencesJson,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
export { empresasPreferencesAdapter } from "@/modules/empresas/config/empresasPreferencesAdapter";
