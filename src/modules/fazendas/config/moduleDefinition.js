import { createCadastroModuleDefinition } from "@/framework/cadastro/moduleSchema";
import { FazendaApi } from "@/modules/fazendas/apis/FazendaApi";
import fazendaRepository from "@/modules/fazendas/repositories/fazendaRepository";
import { fazendaSchema } from "@/modules/fazendas/config/fazendaSchema";

export const FazendasModuleDefinition = createCadastroModuleDefinition({
  moduleId: "fazendas",
  entityName: "FazendaCadastro",
  singularLabel: "Fazenda",
  pluralLabel: "Fazendas",
  repository: fazendaRepository,
  api: FazendaApi,
  schema: fazendaSchema,
});

