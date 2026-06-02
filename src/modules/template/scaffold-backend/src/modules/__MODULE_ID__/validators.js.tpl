import { z } from "zod";

export const __MODULE_ID__CreateSchema = z.object({
  empresa_id: z.string().min(1).optional(),
  codempresa: z.number().int().positive().optional(),
  nome_empresa: z.string().max(255).optional(),
  nome: z.string().min(1).max(255),
  status: z.string().max(32).optional().default("Ativo"),
  observacoes: z.string().optional().nullable(),
  campos_personalizados: z.record(z.any()).optional().default({}),
});

export const __MODULE_ID__UpdateSchema = __MODULE_ID__CreateSchema.partial();

export const __MODULE_ID__FieldCreateSchema = z.object({
  field_name: z.string().min(1).max(128),
  label: z.string().min(1).max(255),
  placeholder: z.string().max(255).optional().nullable(),
  descricao: z.string().optional().nullable(),
  tipo: z.string().min(1).max(64),
  ordem_tabela: z.number().int().optional(),
  largura_coluna: z.number().int().optional(),
  obrigatorio: z.boolean().optional(),
  read_only: z.boolean().optional(),
  visivel_form: z.boolean().optional(),
  visivel_tabela: z.boolean().optional(),
  visivel_relatorio: z.boolean().optional(),
  ativo: z.boolean().optional(),
  opcoes: z.any().optional(),
  options_source: z.string().max(128).optional().nullable(),
  options_label_field: z.string().max(128).optional().nullable(),
  options_value_field: z.string().max(128).optional().nullable(),
  formula: z.string().optional().nullable(),
  usar_decimal: z.boolean().optional(),
  decimal_places: z.number().int().optional(),
  usar_mascara: z.boolean().optional(),
  mascaras_text: z.string().optional().nullable(),
});

export const __MODULE_ID__FieldUpdateSchema = __MODULE_ID__FieldCreateSchema.partial();

