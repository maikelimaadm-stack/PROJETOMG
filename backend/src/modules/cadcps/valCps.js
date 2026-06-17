import { z } from "zod";
import { CADCPS_APLICACAO, CADCPS_TIPOS } from "./cadcpsConstants.js";

const opcaoSchema = z.object({
  codigo: z.string().min(1).max(64),
  descricao: z.string().min(1).max(255),
  ordem: z.number().int().optional(),
  ativo: z.boolean().optional(),
});

export const cadcpsCampoBaseSchema = z.object({
  nome: z.string().min(1).max(255),
  field_name: z.string().min(1).max(128).optional(),
  descricao: z.string().optional().nullable(),
  tipo: z
    .string()
    .min(1)
    .refine((value) => CADCPS_TIPOS.includes(value), { message: "Tipo de campo inválido." }),
  ativo: z.boolean().optional(),
  obrigatorio: z.boolean().optional(),
  read_only: z.boolean().optional(),
  visivel_form: z.boolean().optional(),
  visivel_tabela: z.boolean().optional(),
  visivel_relatorio: z.boolean().optional(),
  pesquisavel: z.boolean().optional(),
  filtravel: z.boolean().optional(),
  exportavel: z.boolean().optional(),
  auditavel: z.boolean().optional(),
  aplicacao_modo: z.enum([CADCPS_APLICACAO.TODAS, CADCPS_APLICACAO.ESPECIFICAS]).optional(),
  empresa_ids: z.array(z.string().min(1)).optional(),
  tela_id: z.string().min(1),
  placeholder: z.string().max(255).optional().nullable(),
  formula: z.string().optional().nullable(),
  calculation_builder: z.any().optional().nullable(),
  usar_mascara: z.boolean().optional(),
  mascaras_text: z.string().optional().nullable(),
  usar_decimal: z.boolean().optional(),
  decimal_places: z.number().int().min(0).max(6).optional(),
  separador_decimal: z.string().max(8).optional(),
  separador_milhar: z.string().max(8).optional(),
  ordem_tabela: z.number().int().optional(),
  largura_coluna: z.number().int().optional(),
  relation_entity: z.string().max(128).optional().nullable(),
  options_label_field: z.string().max(128).optional().nullable(),
  options_value_field: z.string().max(128).optional().nullable(),
  opcoes: z.array(opcaoSchema).optional(),
});

export const cadcpsCampoCreateSchema = cadcpsCampoBaseSchema;
export const cadcpsCampoUpdateSchema = cadcpsCampoBaseSchema.partial().extend({
  tela_id: z.string().min(1).optional(),
});

export const cadcpsListQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(1000).optional(),
  cursor: z.string().optional(),
  includeTotal: z.union([z.boolean(), z.string()]).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
  codigo: z.coerce.number().int().optional(),
  nome: z.string().optional(),
  tipo: z.string().optional(),
  tela_id: z.string().optional(),
  ativo: z.coerce.boolean().optional(),
  obrigatorio: z.coerce.boolean().optional(),
  com_formula: z.coerce.boolean().optional(),
  com_mascara: z.coerce.boolean().optional(),
  com_decimal: z.coerce.boolean().optional(),
  empresa_id: z.string().optional(),
});
