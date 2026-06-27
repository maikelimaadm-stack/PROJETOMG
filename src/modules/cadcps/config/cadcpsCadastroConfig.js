import { createCadastroModuleConfig } from "@/framework/cadastro-engine/core/CadastroModuleConfig.js";
import { registerCadastroModule } from "@/framework/cadastro-engine/core/ModuleRegistry.js";
import {
  buildCpsFormDefaultConfig,
  CPS_FORM_BASE_PANELS,
  CPS_FORM_DEFAULT_LAYOUT,
} from "@/modules/cadcps/config/cpsForm.constants.js";

export const CADCPS_ENTITY_NAME = "CadCpsCampo";

export const cadcpsCadastroConfig = createCadastroModuleConfig({
  moduleId: "cadcps",
  entityName: CADCPS_ENTITY_NAME,
  screenKey: "cadcps.form_layout",
  storagePrefix: "cps",
  getDefaultLayoutConfig: buildCpsFormDefaultConfig,
  basePanels: CPS_FORM_BASE_PANELS,
  defaultFlatLayout: CPS_FORM_DEFAULT_LAYOUT,
  mainTabId: "principais",
  systemPanelIds: ["principais"],
  nativeRequiredFieldNames: ["nome", "tela_id", "tipo"],
});

registerCadastroModule(cadcpsCadastroConfig);

export default cadcpsCadastroConfig;
