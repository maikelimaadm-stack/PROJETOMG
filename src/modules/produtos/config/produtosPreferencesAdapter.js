import { createMakModulePreferencesAdapter } from "@/framework/mak/preferences/createMakModulePreferencesAdapter.js";

export const produtosPreferencesAdapter = createMakModulePreferencesAdapter({
  moduleId: "produtos",
  keyPrefix: "pro",
});
