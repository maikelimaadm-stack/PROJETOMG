import { z } from "zod";

const baseEmpresaSchema = z.object({
  codigo_empresa: z.number().int().positive().optional(),
  razao_social: z.string().min(1).max(255),
  nome_fantasia: z.string().max(255).optional().nullable(),
  tipo_pessoa: z.enum(["PJ", "PF"]).default("PJ"),
  cpf_cnpj: z.string().max(32).optional().nullable(),
  inscricao_estadual: z.string().max(64).optional().nullable(),
  telefone: z.string().max(32).optional().nullable(),
  whatsapp: z.string().max(32).optional().nullable(),
  email: z.string().max(255).optional().nullable(),
  logo_url: z.string().max(2048).optional().nullable(),
  cep: z.string().max(16).optional().nullable(),
  endereco: z.string().max(255).optional().nullable(),
  numero: z.string().max(32).optional().nullable(),
  bairro: z.string().max(255).optional().nullable(),
  cidade: z.string().max(255).optional().nullable(),
  estado: z.string().max(8).optional().nullable(),
  observacoes: z.string().optional().nullable(),
  status: z.string().max(32).default("Ativa"),
  campos_personalizados: z.record(z.any()).default({}),
});

export const empresaCreateSchema = baseEmpresaSchema;
export const empresaUpdateSchema = baseEmpresaSchema.partial();

export const campoPersonalizadoSchema = z.object({
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

export const campoUpdateSchema = campoPersonalizadoSchema.partial();

export const parseOrThrow = (schema, payload, fallbackMessage) => {
  const parsed = schema.safeParse(payload || {});
  if (parsed.success) return parsed.data;
  const firstIssue = parsed.error.issues?.[0];
  const error = new Error(firstIssue?.message || fallbackMessage || "Payload inválido.");
  error.statusCode = 400;
  throw error;
};

