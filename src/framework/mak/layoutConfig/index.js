/** Layout Configuration Engine — promovida integralmente do Cadastro de Empresas. */
export { buildMakLayoutConfigMetadata } from "./buildMakLayoutConfigMetadata.js";
export { createMakLayoutConfigEngine } from "./createMakLayoutConfigEngine.js";
export {
  registerMakLayoutConfigEngine,
  getMakLayoutConfigEngine,
  listMakLayoutConfigEngines,
  hasMakLayoutConfigEngine,
} from "./makLayoutConfigRegistry.js";

export { default as CadLayoutConfigurator } from "@/framework/cadastro-engine/design-system/CadLayoutConfigurator.jsx";
export { LayoutEngine } from "@/framework/cadastro-engine/layout/LayoutEngine.js";
export {
  LayoutPreferencesEngine,
  resetAllLayoutPreferencesSync,
} from "@/framework/cadastro-engine/preferences/LayoutPreferencesEngine.js";
export {
  createCadastroModuleConfig,
  getLayoutStorageKeysForModule,
  getLayoutUpdatedEventName,
  getLayoutHydratedEventName,
} from "@/framework/cadastro-engine/core/CadastroModuleConfig.js";
export { CadastroEngine } from "@/framework/cadastro-engine/core/CadastroEngine.js";
export { useCadastroForm } from "@/framework/cadastro-engine/hooks/useCadastroForm.js";
