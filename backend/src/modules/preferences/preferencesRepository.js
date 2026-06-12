import { getPrismaClient } from "../../database/prismaClient.js";
import { validatePreferenceConfig } from "./layoutValidators/index.js";

const withStatus = (message, statusCode) => {
  const error = new Error(message);
  error.statusCode = statusCode;
  return error;
};

export const preferencesRepository = {
  async get({ scope, screenKey }) {
    const prisma = getPrismaClient();
    const normalizedKey = String(screenKey || "").trim();
    if (!normalizedKey) {
      throw withStatus("Chave de tela inválida.", 400);
    }

    const record = await prisma.usuarioPreferencia.findUnique({
      where: {
        usuario_id_screen_key: {
          usuario_id: scope.userId,
          screen_key: normalizedKey,
        },
      },
      select: {
        config: true,
        updatedAt: true,
      },
    });

    if (!record) return null;
    return record;
  },

  async upsert({ scope, screenKey, config }) {
    const prisma = getPrismaClient();
    const normalizedKey = String(screenKey || "").trim();
    if (!normalizedKey) {
      throw withStatus("Chave de tela inválida.", 400);
    }
    if (config == null || typeof config !== "object") {
      throw withStatus("Configuração inválida.", 400);
    }

    const validatedConfig = validatePreferenceConfig(normalizedKey, config);

    const record = await prisma.usuarioPreferencia.upsert({
      where: {
        usuario_id_screen_key: {
          usuario_id: scope.userId,
          screen_key: normalizedKey,
        },
      },
      create: {
        usuario_id: scope.userId,
        cliente_id: scope.clienteId,
        screen_key: normalizedKey,
        config: validatedConfig,
      },
      update: {
        config: validatedConfig,
        cliente_id: scope.clienteId,
      },
      select: {
        config: true,
        updatedAt: true,
      },
    });

    return record;
  },
};
