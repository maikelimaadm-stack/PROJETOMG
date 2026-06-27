import { createMakModulePreferencesAdapter } from "@/framework/mak/preferences/createMakModulePreferencesAdapter.js";

export const cadcpsPreferencesAdapter = createMakModulePreferencesAdapter({
  moduleId: "cadcps",
  keyPrefix: "cps",
});
