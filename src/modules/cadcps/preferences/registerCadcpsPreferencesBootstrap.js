import { createMakStandardModulePreferencesBootstrap } from "@/framework/mak/preferences/createMakStandardModulePreferencesBootstrap.js";
import { registerMakPreferencesBootstrapModule } from "@/framework/mak/preferences/bootstrapRegistry.js";
import { cadcpsModuleMetadata } from "@/modules/cadcps/config/cadcpsModuleMetadata.js";

const cadcpsPreferencesBootstrap = createMakStandardModulePreferencesBootstrap({
  moduleId: "cadcps",
  keyPrefix: "cps",
  tableMetadata: cadcpsModuleMetadata.table,
  searchMetadata: cadcpsModuleMetadata.search,
  loadBatchStorageKey: "cps_infinite_batch_size",
});

export const cadcpsPreferencesAdapter = cadcpsPreferencesBootstrap.adapter;
export const useCadcpsPreferencesBootstrap = cadcpsPreferencesBootstrap.useBootstrapHook;

registerMakPreferencesBootstrapModule("cadcps", useCadcpsPreferencesBootstrap);

export default cadcpsPreferencesBootstrap;
