import { z } from "zod";

export const cadastroModuleSchema = z.object({
  moduleId: z.string().min(2),
  entityName: z.string().min(2),
  singularLabel: z.string().min(2),
  pluralLabel: z.string().min(2),
  repository: z.any(),
  api: z.any(),
  schema: z.any(),
});

export const createCadastroModuleDefinition = (definition) =>
  cadastroModuleSchema.parse(definition);

