import { createCadastroModuleDefinition } from "@/framework/cadastro/moduleSchema";
import { apiCps } from "@/apis/cadcps/apiCps";
import repCps from "@/modules/cadcps/repositories/repCps";
import { cadcpsFormSchema } from "@/modules/cadcps/config/cadcpsSchema";

export const cadcpsModuleDefinition = createCadastroModuleDefinition({
  moduleId: "cadcps",
  entityName: "CadCpsCampo",
  singularLabel: "Campo Personalizado",
  pluralLabel: "Campos Personalizados",
  repository: repCps,
  api: apiCps,
  schema: cadcpsFormSchema,
});
