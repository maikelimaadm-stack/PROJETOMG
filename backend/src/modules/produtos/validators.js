import { z } from "zod";

export const produtoCreateSchema = z.object({
  nome: z.string().min(1, "Nome é obrigatório"),
  status: z.string().optional().default("Ativo"),
  descricao: z.string().optional().nullable(),
  preco: z.coerce.number().optional().nullable(),
});

export const produtoUpdateSchema = produtoCreateSchema.partial();

export const produtoListQuerySchema = z.object({
  page: z.coerce.number().optional().default(1),
  pageSize: z.coerce.number().optional().default(50),
  search: z.string().optional().default(""),
  sortBy: z.string().optional().default("codigo"),
  sortDir: z.enum(["asc", "desc"]).optional().default("asc"),
});
