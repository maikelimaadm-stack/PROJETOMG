import { loadAccessScope } from "../auth/accessScope.js";
import { produtoService } from "./services/produtoService.js";
import { produtoCreateSchema, produtoListQuerySchema, produtoUpdateSchema } from "./validators.js";

const parseOrThrow = (schema, data, message) => {
  const parsed = schema.safeParse(data);
  if (parsed.success) return parsed.data;
  const issue = parsed.error.issues?.[0];
  const error = new Error(issue?.message || message);
  error.statusCode = 400;
  throw error;
};

export const registerModuleRoutes = async (app) => {
  app.get("/api/produtos", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    let filters = {};
    if (request.query?.filters) {
      try {
        filters = JSON.parse(String(request.query.filters));
      } catch {
        filters = {};
      }
    }
    const query = parseOrThrow(produtoListQuerySchema, request.query || {}, "Query inválida.");
    return produtoService.list(scope, { ...query, filters });
  });

  app.get("/api/produtos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const item = await produtoService.get(scope, request.params.id);
    if (!item) return reply.status(404).send({ message: "Produto não encontrado." });
    return { item };
  });

  app.post("/api/produtos", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const payload = parseOrThrow(produtoCreateSchema, request.body || {}, "Payload inválido.");
    try {
      const item = await produtoService.create(scope, payload);
      return reply.status(201).send({ item });
    } catch (error) {
      const statusCode = error.statusCode || 500;
      return reply.status(statusCode).send({ message: error.message || "Falha ao criar produto." });
    }
  });

  app.put("/api/produtos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const payload = parseOrThrow(produtoUpdateSchema, request.body || {}, "Payload inválido.");
    const item = await produtoService.update(scope, request.params.id, payload);
    if (!item) return reply.status(404).send({ message: "Produto não encontrado." });
    return { item };
  });

  app.delete("/api/produtos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const result = await produtoService.remove(scope, request.params.id);
    if (!result) return reply.status(404).send({ message: "Produto não encontrado." });
    return { ok: true };
  });
};
