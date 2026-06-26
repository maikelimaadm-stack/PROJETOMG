/** Hooks genéricos de cadastro — promovidos e generalizados a partir dos hooks master Empresas (useEmp*). */
export { useSaveCycle } from "@/shared/hooks/useSaveCycle";
export { useDebouncedValue } from "@/shared/hooks/useDebouncedValue";
export * from "@/ModeloBase1/actions/index.js";
export { useModeloBase1InfiniteListData } from "./useModeloBase1InfiniteListData.js";
export { useModeloBase1Favorites } from "./useModeloBase1Favorites.js";
export { useModeloBase1ViewModePreference } from "./useModeloBase1ViewModePreference.js";
export { useModeloBase1CustomFields } from "./useModeloBase1CustomFields.js";
export { useModeloBase1PreferencesBootstrap } from "./useModeloBase1PreferencesBootstrap.js";
export {
  useModeloBase1SearchDropdownFields,
  useModeloBase1CardsVisFields,
  useModeloBase1FilterFieldsLayout,
} from "./useModeloBase1SearchViewHooks.js";
