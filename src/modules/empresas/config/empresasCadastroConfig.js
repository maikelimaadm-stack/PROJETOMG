import { createCadastroModuleConfig } from "@/framework/cadastro-engine/core/CadastroModuleConfig.js";
import { registerCadastroModule } from "@/framework/cadastro-engine/core/ModuleRegistry.js";
import { cadastroFieldsApi } from "@/framework/cadastro-engine/api/cadastroFieldsApi.js";
import empRepository from "@/modules/empresas/repositories/empRepository";
import {
  buildEmpFormDefaultConfig,
  EMP_FORM_BASE_PANELS,
  EMP_FORM_DEFAULT_LAYOUT,
  FORM_LAYOUT_KEY,
} from "@/modules/empresas/components/formEmp.constants";

export const EMPRESAS_ENTITY_NAME = "EmpresaCadastro";

export const empresasCadastroConfig = createCadastroModuleConfig({
  moduleId: "empresas",
  entityName: EMPRESAS_ENTITY_NAME,
  screenKey: "empresas.form_layout",
  storagePrefix: "emp",
  legacyGlobalStorageKey: FORM_LAYOUT_KEY,
  getDefaultLayoutConfig: buildEmpFormDefaultConfig,
  basePanels: EMP_FORM_BASE_PANELS,
  defaultFlatLayout: EMP_FORM_DEFAULT_LAYOUT,
  mainTabId: "principais",
  systemPanelIds: ["principais", "endereco", "observacoes", "campos_personalizados"],
  customFieldsQueryKey: "emp-campos-personalizados",
  customFieldProvider: (mode) => cadastroFieldsApi.listCampos(EMPRESAS_ENTITY_NAME, { mode }),
  optionsProvider: (sources) => empRepository.listOptionsSources(sources),
  nativeRequiredFieldNames: ["razao_social", "tipo_pessoa"],
});

registerCadastroModule(empresasCadastroConfig);

export default empresasCadastroConfig;
