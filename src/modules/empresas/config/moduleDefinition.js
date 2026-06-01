import { createCadastroModuleDefinition } from "@/framework/cadastro/moduleSchema";
import { EmpresaApi } from "@/apis/empresa/EmpresaApi";
import empRepository from "@/modules/empresas/repositories/empRepository";
import { empresasSchema } from "@/modules/empresas/config/empresasSchema";

export const empresasModuleDefinition = createCadastroModuleDefinition({
  moduleId: "empresas",
  entityName: "EmpresaCadastro",
  singularLabel: "Empresa",
  pluralLabel: "Empresas",
  repository: empRepository,
  api: EmpresaApi,
  schema: empresasSchema,
});

