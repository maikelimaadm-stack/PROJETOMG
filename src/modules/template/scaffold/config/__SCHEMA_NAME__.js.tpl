import { z } from "zod";

export const __SCHEMA_NAME__ = z.object({
  codigo: z.preprocess((value) => {
    if (value === "" || value == null) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, z.number().int().positive().optional()),
  nome: z.string().min(1, "Nome é obrigatório"),
  status: z.string().default("Ativo"),
  observacoes: z.string().optional().nullable(),
});
