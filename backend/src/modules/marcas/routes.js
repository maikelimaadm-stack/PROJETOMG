import { loadAccessScope } from "../auth/accessScope.js";
import { marcaService } from "./services/marcaService.js";
import { marcaCreateSchema, marcaListQuerySchema, marcaUpdateSchema } from "./validators.js";

const parseOrThrow = (schema, data, message) => {
  const parsed = schema.safeParse(data);
  if (parsed.success) return parsed.data;
  const issue = parsed.error.issues?.[0];
  const error = new Error(issue?.message || message);
  error.statusCode = 400;
  throw error;
};

export const registerModuleRoutes = async (app) => {
  app.get("/api/marcas", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    let filters = {};
    if (request.query?.filters) {
      try {
        filters = JSON.parse(String(request.query.filters));
      } catch {
        filters = {};
      }
    }
    const query = parseOrThrow(marcaListQuerySchema, request.query || {}, "Query inválida.");
    return marcaService.list(scope, { ...query, filters });
  });

  app.get("/api/marcas/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const item = await marcaService.get(scope, request.params.id);
    if (!item) return reply.status(404).send({ message: "Marca não encontrada." });
    return { item };
  });

  app.post("/api/marcas", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const payload = parseOrThrow(marcaCreateSchema, request.body || {}, "Payload inválido.");
    try {
      const item = await marcaService.create(scope, payload);
      return reply.status(201).send({ item });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send({ message: error.message || "Falha ao criar marca." });
    }
  });

  app.put("/api/marcas/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const payload = parseOrThrow(marcaUpdateSchema, request.body || {}, "Payload inválido.");
    const item = await marcaService.update(scope, request.params.id, payload);
    if (!item) return reply.status(404).send({ message: "Marca não encontrada." });
    return { item };
  });

  app.delete("/api/marcas/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const result = await marcaService.remove(scope, request.params.id);
    if (!result) return reply.status(404).send({ message: "Marca não encontrada." });
    return { ok: true };
  });
};
