import { createMakStandardModulePreferencesBootstrap } from "@/framework/mak/preferences/createMakStandardModulePreferencesBootstrap.js";
import { registerMakPreferencesBootstrapModule } from "@/framework/mak/preferences/bootstrapRegistry.js";
import { produtosModuleMetadata } from "@/modules/produtos/config/produtosModuleMetadata.js";

const produtosPreferencesBootstrap = createMakStandardModulePreferencesBootstrap({
  moduleId: "produtos",
  keyPrefix: "pro",
  tableMetadata: produtosModuleMetadata.table,
  searchMetadata: produtosModuleMetadata.search,
  loadBatchStorageKey: "pro_infinite_batch_size",
});

export const produtosPreferencesAdapter = produtosPreferencesBootstrap.adapter;
export const useProdutosPreferencesBootstrap = produtosPreferencesBootstrap.useBootstrapHook;

registerMakPreferencesBootstrapModule("produtos", useProdutosPreferencesBootstrap);

export default produtosPreferencesBootstrap;
