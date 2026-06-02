import { z } from "zod";

export const loginSchema = z.object({
  cliente: z.string().min(1, "Cliente é obrigatório"),
  usuario: z.string().min(1, "Usuário é obrigatório"),
  senha: z.string().min(1, "Senha é obrigatória"),
});

