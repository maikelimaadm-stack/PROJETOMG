import { loadAccessScope, assertRole } from "../auth/accessScope.js";
import { getContadores } from "../metrics/metricsService.js";
import { svcCps } from "./svcCps.js";
import {
  cadcpsCampoCreateSchema,
  cadcpsCampoUpdateSchema,
  cadcpsListQuerySchema,
} from "./valCps.js";
import { normalizeLegacyCampoPayload } from "./legacyPayloadMapper.js";

const ensureAdmin = (scope) => assertRole(scope, ["ADMIN"]);

const parseOrThrow = (schema, data, message) => {
  const parsed = schema.safeParse(data);
  if (parsed.success) return parsed.data;
  const issue = parsed.error.issues?.[0];
  const error = new Error(issue?.message || message);
  error.statusCode = 400;
  throw error;
};

export const registerCadcpsRoutes = async (app) => {
  // Seed de telas não bloqueia o registro de rotas (evita FST_ERR_PLUGIN_TIMEOUT no Railway).
  void svcCps.ensureTelasSeed().catch((error) => {
    app.log.error({ err: error }, "Seed telas CADCPS em background falhou — GET /telas tentará novamente.");
  });

  app.get("/api/cadcps/telas", { preHandler: app.authenticate }, async () => {
    let items = await svcCps.listTelas();
    if (!items.length) {
      try {
        await svcCps.ensureTelasSeed();
      } catch (error) {
        app.log.error({ err: error }, "Falha ao sincronizar telas CADCPS.");
      }
      items = await svcCps.listTelas();
    }
    return { items };
  });

  app.get("/api/cadcps/campos", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parseOrThrow(cadcpsListQuerySchema, request.query || {}, "Query inválida.");
    let filters = {};
    if (request.query?.filters) {
      try {
        filters = JSON.parse(String(request.query.filters));
      } catch {
        filters = {};
      }
    }
    return svcCps.list(scope, { ...query, filters });
  });

  app.get("/api/cadcps/campos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const item = await svcCps.get(scope, request.params.id);
    if (!item) return reply.status(404).send({ message: "Campo não encontrado." });
    return { item };
  });

  app.get(
    "/api/cadcps/campos/:id/historico",
    { preHandler: app.authenticate },
    async (request, reply) => {
      const scope = await loadAccessScope(request);
      const item = await svcCps.get(scope, request.params.id);
      if (!item) return reply.status(404).send({ message: "Campo não encontrado." });
      const items = await svcCps.listHistorico(scope, request.params.id);
      return { items };
    }
  );

  app.post("/api/cadcps/campos", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureAdmin(scope);
    const normalized = await normalizeLegacyCampoPayload(request.body || {});
    const payload = parseOrThrow(
      cadcpsCampoCreateSchema,
      normalized,
      "Payload inválido para criação."
    );
    const item = await svcCps.create(scope, payload);
    const contadores = await getContadores(scope);
    return reply.status(201).send({ item, contadores });
  });

  app.put("/api/cadcps/campos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureAdmin(scope);
    const normalized = await normalizeLegacyCampoPayload(request.body || {});
    const payload = parseOrThrow(
      cadcpsCampoUpdateSchema,
      normalized,
      "Payload inválido para atualização."
    );
    const item = await svcCps.update(scope, request.params.id, payload);
    if (!item) return reply.status(404).send({ message: "Campo não encontrado." });
    return { item };
  });

  app.delete("/api/cadcps/campos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    ensureAdmin(scope);
    const ok = await svcCps.remove(scope, request.params.id);
    if (!ok) return reply.status(404).send({ message: "Campo não encontrado." });
    const contadores = await getContadores(scope);
    return { ok: true, contadores };
  });

  /** Listagem aplicável por entity_name (integração módulos de cadastro) */
  app.get(
    "/api/cadcps/aplicavel/:entityName",
    { preHandler: app.authenticate },
    async (request) => {
      const scope = await loadAccessScope(request);
      const items = await svcCps.listApplicableLegacy(scope, request.params.entityName);
      return { items };
    }
  );
};
