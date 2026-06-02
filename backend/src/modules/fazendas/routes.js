import { z } from "zod";
import { loadAccessScope, assertRole } from "../auth/accessScope.js";
import { fazendasController } from "./controller.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(200).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export const registerModuleRoutes = async (app) => {
  app.get("/api/fazendas", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const parsed = listQuerySchema.safeParse(request.query || {});
    if (!parsed.success) return reply.status(400).send({ message: "Query inválida." });
    return fazendasController.list({ scope, query: parsed.data });
  });

  app.get("/api/fazendas/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    return fazendasController.getById({ scope, id: request.params.id, reply });
  });

  app.post("/api/fazendas", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    return fazendasController.create({ scope, payload: request.body || {}, reply });
  });

  app.put("/api/fazendas/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    return fazendasController.update({
      scope,
      id: request.params.id,
      payload: request.body || {},
      reply,
    });
  });

  app.delete("/api/fazendas/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN"]);
    return fazendasController.remove({ scope, id: request.params.id, reply });
  });

  app.get("/api/fazendas/campos", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return fazendasController.listFields({ scope, query: request.query || {} });
  });

  app.post("/api/fazendas/campos", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    return fazendasController.createField({
      scope,
      payload: request.body || {},
      reply,
    });
  });

  app.put("/api/fazendas/campos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    return fazendasController.updateField({
      scope,
      id: request.params.id,
      payload: request.body || {},
      reply,
    });
  });

  app.delete("/api/fazendas/campos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN"]);
    return fazendasController.removeField({
      scope,
      id: request.params.id,
      reply,
    });
  });

  app.post("/api/fazendas/options", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return fazendasController.listOptions({ scope, payload: request.body || {} });
  });
};

