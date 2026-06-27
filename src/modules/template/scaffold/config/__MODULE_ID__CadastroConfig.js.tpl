import { createCadastroModuleConfig } from "@/framework/cadastro-engine/core/CadastroModuleConfig.js";
import { registerCadastroModule } from "@/framework/cadastro-engine/core/ModuleRegistry.js";
import {
  build__KEY_PREFIX_PASCAL__FormDefaultConfig,
  __KEY_PREFIX_UPPER___FORM_BASE_PANELS,
  __KEY_PREFIX_UPPER___FORM_DEFAULT_LAYOUT,
} from "@/modules/__MODULE_ID__/config/__KEY_PREFIX__Form.constants.js";

export const __MODULE_ID_UPPER___ENTITY_NAME = "__ENTITY_NAME__";

export const __MODULE_ID__CadastroConfig = createCadastroModuleConfig({
  moduleId: "__MODULE_ID__",
  entityName: __MODULE_ID_UPPER___ENTITY_NAME,
  screenKey: "__MODULE_ID__.form_layout",
  storagePrefix: "__KEY_PREFIX__",
  getDefaultLayoutConfig: build__KEY_PREFIX_PASCAL__FormDefaultConfig,
  basePanels: __KEY_PREFIX_UPPER___FORM_BASE_PANELS,
  defaultFlatLayout: __KEY_PREFIX_UPPER___FORM_DEFAULT_LAYOUT,
  mainTabId: "principais",
  systemPanelIds: ["principais"],
  nativeRequiredFieldNames: ["nome"],
});

registerCadastroModule(__MODULE_ID__CadastroConfig);

export default __MODULE_ID__CadastroConfig;
