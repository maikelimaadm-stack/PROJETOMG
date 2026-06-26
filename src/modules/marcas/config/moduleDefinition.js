import { createCadastroModuleDefinition } from "@/framework/cadastro/moduleSchema";
import { MarcaApi } from "@/apis/marcas/MarcaApi";
import marcaRepository from "@/modules/marcas/repositories/marcaRepository";
import { marcasSchema } from "@/modules/marcas/config/marcasSchema";

export const marcasModuleDefinition = createCadastroModuleDefinition({
  moduleId: "marcas",
  entityName: "MarcaCadastro",
  singularLabel: "Marca",
  pluralLabel: "Marcas",
  repository: marcaRepository,
  api: MarcaApi,
  schema: marcasSchema,
});
