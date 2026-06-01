import { createCadastroModuleDefinition } from "@/framework/cadastro/moduleSchema";
import { TemplateApi } from "@/modules/template/apis/TemplateApi";
import templateRepository from "@/modules/template/repositories/templateRepository";
import { templateSchema } from "@/modules/template/config/templateSchema";

export const templateModuleDefinition = createCadastroModuleDefinition({
  moduleId: "template",
  entityName: "TemplateCadastro",
  singularLabel: "Template",
  pluralLabel: "Templates",
  repository: templateRepository,
  api: TemplateApi,
  schema: templateSchema,
});

