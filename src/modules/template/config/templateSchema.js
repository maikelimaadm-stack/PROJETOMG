import { z } from "zod";

export const templateSchema = z.object({
  id: z.string().optional(),
  nome: z.string().min(1),
  status: z.string().default("Ativo"),
  observacoes: z.string().optional().nullable(),
  campos_personalizados: z.record(z.any()).default({}),
});

