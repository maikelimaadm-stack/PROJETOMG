import { z } from "zod";

export const empresasSchema = z.object({
  codempresa: z.preprocess((value) => {
    if (value === "" || value == null) return undefined;
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : value;
  }, z.number().int().positive().optional()),
  razao_social: z.string().min(1),
  nome_fantasia: z.string().optional().nullable(),
  tipo_pessoa: z.enum(["PJ", "PF"]).default("PJ"),
  tipo_vinculo: z.preprocess((value) => {
    if (value === "" || value == null) return null;
    return value;
  }, z.enum(["proprietario", "arrendatario"]).optional().nullable()),
  cpf_cnpj: z.string().optional().nullable(),
  inscricao_estadual: z.string().optional().nullable(),
  telefone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().optional().nullable(),
  logo_url: z.string().optional().nullable(),
  cep: z.string().optional().nullable(),
  endereco: z.string().optional().nullable(),
  numero: z.string().optional().nullable(),
  bairro: z.string().optional().nullable(),
  cidade: z.string().optional().nullable(),
  estado: z.string().optional().nullable(),
  observacoes: z.string().optional().nullable(),
  status: z.string().default("Ativa"),
  campos_personalizados: z.record(z.any()).default({}),
});

