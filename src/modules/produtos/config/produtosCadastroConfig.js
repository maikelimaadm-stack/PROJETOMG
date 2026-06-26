import { createCadastroModuleConfig } from "@/framework/cadastro-engine/core/CadastroModuleConfig.js";
import { registerCadastroModule } from "@/framework/cadastro-engine/core/ModuleRegistry.js";
import {
  buildProFormDefaultConfig,
  PRO_FORM_BASE_PANELS,
  PRO_FORM_DEFAULT_LAYOUT,
} from "@/modules/produtos/config/proForm.constants.js";

export const PRODUTOS_ENTITY_NAME = "ProdutoCadastro";

export const produtosCadastroConfig = createCadastroModuleConfig({
  moduleId: "produtos",
  entityName: PRODUTOS_ENTITY_NAME,
  screenKey: "produtos.form_layout",
  storagePrefix: "pro",
  getDefaultLayoutConfig: buildProFormDefaultConfig,
  basePanels: PRO_FORM_BASE_PANELS,
  defaultFlatLayout: PRO_FORM_DEFAULT_LAYOUT,
  mainTabId: "principais",
  systemPanelIds: ["principais"],
  nativeRequiredFieldNames: ["nome"],
});

registerCadastroModule(produtosCadastroConfig);

export default produtosCadastroConfig;
