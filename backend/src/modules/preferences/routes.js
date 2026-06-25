import { loadAccessScope } from "../auth/accessScope.js";
import { preferencesRepository } from "./preferencesRepository.js";
import { rejectClientControlledIdentityFields } from "./rejectClientControlledIdentityFields.js";

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

const parseScopeSegment = (value, label) => {
  const normalized = String(value || "").trim().toLowerCase();
  if (!normalized || normalized.length > 64) {
    const error = new Error(`${label} inválido.`);
    error.statusCode = 400;
    throw error;
  }
  if (!/^[a-z0-9._-]+$/i.test(normalized)) {
    const error = new Error(`${label} contém caracteres inválidos.`);
    error.statusCode = 400;
    throw error;
  }
  return normalized;
};

export const registerPreferencesRoutes = async (app) => {
  app.get(
    "/api/user/preferences/bootstrap",
    { preHandler: app.authenticate },
    async (request, reply) => {
      try {
        const scope = await loadAccessScope(request);
        const records = await preferencesRepository.listAllByScope({ scope });
        return {
          preferences: records.map((record) => ({
            modulo: record.modulo,
            tela: record.tela,
            versao_schema: record.versao_schema,
            preferencias: record.preferencias_json,
            updatedAt: record.updatedAt,
          })),
        };
      } catch (error) {
        const statusCode = error.statusCode || 500;
        return reply.status(statusCode).send({
          message: error.message || "Falha ao carregar preferências.",
        });
      }
    }
  );

  app.get(
    "/api/user/preferences/:modulo/:tela",
    { preHandler: app.authenticate },
    async (request, reply) => {
      try {
        const scope = await loadAccessScope(request);
        const modulo = parseScopeSegment(request.params.modulo, "Módulo");
        const tela = parseScopeSegment(request.params.tela, "Tela");
        const record = await preferencesRepository.getByScope({ scope, modulo, tela });
        if (!record) {
          return reply.status(404).send({ message: "Preferência não encontrada." });
        }
        return {
          modulo: record.modulo,
          tela: record.tela,
          versao_schema: record.versao_schema,
          preferencias: record.preferencias_json,
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
    "/api/user/preferences/:modulo/:tela",
    { preHandler: app.authenticate },
    async (request, reply) => {
      try {
        const scope = await loadAccessScope(request);
        rejectClientControlledIdentityFields(request.body);
        const modulo = parseScopeSegment(request.params.modulo, "Módulo");
        const tela = parseScopeSegment(request.params.tela, "Tela");
        const preferencias = request.body?.preferencias || request.body?.config;
        const versaoSchema = request.body?.versao_schema || request.body?.version;
        const expectedUpdatedAt = request.body?.expectedUpdatedAt || request.body?.updatedAt;
        const record = await preferencesRepository.upsertByScope({
          scope,
          modulo,
          tela,
          preferencias,
          versaoSchema,
          expectedUpdatedAt,
        });
        return {
          modulo: record.modulo,
          tela: record.tela,
          versao_schema: record.versao_schema,
          preferencias: record.preferencias_json,
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
        rejectClientControlledIdentityFields(request.body);
        const screenKey = parseScreenKey(request.params.screenKey);
        const config = request.body?.config;
        const expectedUpdatedAt = request.body?.expectedUpdatedAt || request.body?.updatedAt;
        const record = await preferencesRepository.upsert({
          scope,
          screenKey,
          config,
          expectedUpdatedAt,
        });
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
