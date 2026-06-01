import { z } from "zod";

export const __SCHEMA_NAME__ = z.object({
  id: z.string().optional(),
  nome: z.string().min(1, "Nome é obrigatório"),
  status: z.string().default("Ativo"),
  observacoes: z.string().optional().nullable(),
  campos_personalizados: z.record(z.any()).default({}),
});

