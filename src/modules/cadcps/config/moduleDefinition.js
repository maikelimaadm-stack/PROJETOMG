import repCps from "@/modules/cadcps/repositories/repCps";
import { cadcpsFormSchema } from "@/modules/cadcps/config/cadcpsSchema";

export const cadcpsModuleDefinition = {
  moduleId: "cadcps",
  entityName: "CadCpsCampo",
  singularLabel: "Campo Personalizado",
  pluralLabel: "Campos Personalizados",
  repository: repCps,
  schema: cadcpsFormSchema,
};
