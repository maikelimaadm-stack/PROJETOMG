import { z } from "zod";

export const __SCHEMA_NAME__ = z.object({
  id: z.string().optional(),
  empresa_id: z.string().optional(),
  codempresa: z.number().int().positive().optional(),
  nome_empresa: z.string().optional().nullable(),
  nome: z.string().min(1, "Nome é obrigatório"),
  status: z.string().default("Ativo"),
  observacoes: z.string().optional().nullable(),
  campos_personalizados: z.record(z.any()).default({}),
});

