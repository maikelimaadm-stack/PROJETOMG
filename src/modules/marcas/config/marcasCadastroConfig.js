import { createCadastroModuleConfig } from "@/framework/cadastro-engine/core/CadastroModuleConfig.js";
import { registerCadastroModule } from "@/framework/cadastro-engine/core/ModuleRegistry.js";
import {
  buildMarFormDefaultConfig,
  MAR_FORM_BASE_PANELS,
  MAR_FORM_DEFAULT_LAYOUT,
} from "@/modules/marcas/config/marForm.constants.js";

export const MARCAS_ENTITY_NAME = "MarcaCadastro";

export const marcasCadastroConfig = createCadastroModuleConfig({
  moduleId: "marcas",
  entityName: MARCAS_ENTITY_NAME,
  screenKey: "marcas.form_layout",
  storagePrefix: "mar",
  getDefaultLayoutConfig: buildMarFormDefaultConfig,
  basePanels: MAR_FORM_BASE_PANELS,
  defaultFlatLayout: MAR_FORM_DEFAULT_LAYOUT,
  mainTabId: "principais",
  systemPanelIds: ["principais"],
  nativeRequiredFieldNames: ["nome"],
});

registerCadastroModule(marcasCadastroConfig);

export default marcasCadastroConfig;
