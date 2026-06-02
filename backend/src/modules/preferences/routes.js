import { loadAccessScope } from "../auth/accessScope.js";
import { preferencesRepository } from "./preferencesRepository.js";

const parseScreenKey = (screenKey) => {
  const normalized = String(screenKey || "").trim();
  if (!normalized || normalized.length > 128) {
    const error = new Error("Chave de tela inválida.");
    error.statusCode = 400;
    throw error;
  }
  if (!/^[a-z0-9._-]+$/i.test(normalized)) {
    const error = new Error("Chave de tela contém caracteres inválidos.");
    error.statusCode = 400;
    throw error;
  }
  return normalized;
};

export const registerPreferencesRoutes = async (app) => {
  app.get(
    "/api/preferences/:screenKey",
    { preHandler: app.authenticate },
    async (request, reply) => {
      try {
        const scope = await loadAccessScope(request);
        const screenKey = parseScreenKey(request.params.screenKey);
        const record = await preferencesRepository.get({ scope, screenKey });
        if (!record) {
          return reply.status(404).send({ message: "Preferência não encontrada." });
        }
        return {
          screenKey,
          config: record.config,
          updatedAt: record.updatedAt,
        };
      } catch (error) {
        const statusCode = error.statusCode || 500;
        return reply.status(statusCode).send({
          message: error.message || "Falha ao carregar preferência.",
        });
      }
    }
  );

  app.put(
    "/api/preferences/:screenKey",
    { preHandler: app.authenticate },
    async (request, reply) => {
      try {
        const scope = await loadAccessScope(request);
        const screenKey = parseScreenKey(request.params.screenKey);
        const config = request.body?.config;
        const record = await preferencesRepository.upsert({ scope, screenKey, config });
        return {
          screenKey,
          config: record.config,
          updatedAt: record.updatedAt,
        };
      } catch (error) {
        const statusCode = error.statusCode || 500;
        return reply.status(statusCode).send({
          message: error.message || "Falha ao salvar preferência.",
        });
      }
    }
  );
};
