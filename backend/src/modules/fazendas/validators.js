import { z } from "zod";
import {
  campoPersonalizadoCreateSchema,
  campoPersonalizadoUpdateSchema,
} from "../campos/campoPersonalizadoValidators.js";

export const fazendasCreateSchema = z.object({
  empresa_id: z.string().min(1).optional(),
  codigo_empresa: z.number().int().positive().optional(),
  nome_empresa: z.string().max(255).optional(),
  nome: z.string().min(1).max(255),
  status: z.string().max(32).optional().default("Ativo"),
  observacoes: z.string().optional().nullable(),
  campos_personalizados: z.record(z.any()).optional().default({}),
});

export const fazendasUpdateSchema = fazendasCreateSchema.partial();
export const fazendasFieldCreateSchema = campoPersonalizadoCreateSchema;
export const fazendasFieldUpdateSchema = campoPersonalizadoUpdateSchema;
