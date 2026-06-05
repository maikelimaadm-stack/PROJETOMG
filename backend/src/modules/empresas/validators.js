import { z } from "zod";

const baseEmpresaSchema = z.object({
  codempresa: z.number().int().positive().optional(),
  razao_social: z.string().min(1).max(255),
  nome_fantasia: z.string().max(255).optional().nullable(),
  tipo_pessoa: z.enum(["PJ", "PF"]).default("PJ"),
  tipo_vinculo: z.preprocess((value) => {
    if (value === "" || value == null) return null;
    return value;
  }, z.enum(["proprietario", "arrendatario"]).optional().nullable()),
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

export const parseOrThrow = (schema, payload, fallbackMessage) => {
  const parsed = schema.safeParse(payload || {});
  if (parsed.success) return parsed.data;
  const firstIssue = parsed.error.issues?.[0];
  const error = new Error(firstIssue?.message || fallbackMessage || "Payload inválido.");
  error.statusCode = 400;
  throw error;
};
