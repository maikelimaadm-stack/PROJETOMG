import { z } from "zod";

export const __MODULE_ID__CreateSchema = z.object({
  empresa_id: z.string().min(1),
  codigo_empresa: z.number().int().positive().optional(),
  nome_empresa: z.string().max(255).optional(),
});

export const __MODULE_ID__UpdateSchema = __MODULE_ID__CreateSchema.partial();

