import { createMakStandardModulePreferencesBootstrap } from "@/framework/mak/preferences/createMakStandardModulePreferencesBootstrap.js";
import { registerMakPreferencesBootstrapModule } from "@/framework/mak/preferences/bootstrapRegistry.js";
import { marcasModuleMetadata } from "@/modules/marcas/config/marcasModuleMetadata.js";

const marcasPreferencesBootstrap = createMakStandardModulePreferencesBootstrap({
  moduleId: "marcas",
  keyPrefix: "mar",
  tableMetadata: marcasModuleMetadata.table,
  searchMetadata: marcasModuleMetadata.search,
  loadBatchStorageKey: "mar_infinite_batch_size",
});

export const marcasPreferencesAdapter = marcasPreferencesBootstrap.adapter;
export const useMarcasPreferencesBootstrap = marcasPreferencesBootstrap.useBootstrapHook;

registerMakPreferencesBootstrapModule("marcas", useMarcasPreferencesBootstrap);

export default marcasPreferencesBootstrap;
