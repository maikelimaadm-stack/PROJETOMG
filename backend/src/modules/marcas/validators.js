import { z } from "zod";

export const marcaCreateSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  status: z.string().optional().default("Ativo"),
  observacoes: z.string().optional().nullable(),
});

export const marcaUpdateSchema = marcaCreateSchema.partial();

export const marcaListQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(50),
  search: z.string().optional().default(""),
  sortBy: z.string().optional().default("codigo"),
  sortDir: z.enum(["asc", "desc"]).optional().default("asc"),
});
