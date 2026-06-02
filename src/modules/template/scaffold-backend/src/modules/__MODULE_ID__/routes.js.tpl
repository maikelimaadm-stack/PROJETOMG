import { z } from "zod";
import { loadAccessScope, assertRole } from "../auth/accessScope.js";
import { __MODULE_ID__Controller } from "./controller.js";

const listQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional(),
  pageSize: z.coerce.number().int().positive().max(200).optional(),
  search: z.string().optional(),
  sortBy: z.string().optional(),
  sortDir: z.enum(["asc", "desc"]).optional(),
});

export const registerModuleRoutes = async (app) => {
  app.get("/api/__MODULE_ID__", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    const parsed = listQuerySchema.safeParse(request.query || {});
    if (!parsed.success) return reply.status(400).send({ message: "Query inválida." });
    return __MODULE_ID__Controller.list({ scope, query: parsed.data });
  });

  app.get("/api/__MODULE_ID__/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    return __MODULE_ID__Controller.getById({ scope, id: request.params.id, reply });
  });

  app.post("/api/__MODULE_ID__", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    return __MODULE_ID__Controller.create({ scope, payload: request.body || {}, reply });
  });

  app.put("/api/__MODULE_ID__/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    return __MODULE_ID__Controller.update({
      scope,
      id: request.params.id,
      payload: request.body || {},
      reply,
    });
  });

  app.delete("/api/__MODULE_ID__/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN"]);
    return __MODULE_ID__Controller.remove({ scope, id: request.params.id, reply });
  });

  app.get("/api/__MODULE_ID__/campos", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return __MODULE_ID__Controller.listFields({ scope });
  });

  app.post("/api/__MODULE_ID__/campos", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    return __MODULE_ID__Controller.createField({
      scope,
      payload: request.body || {},
      reply,
    });
  });

  app.put("/api/__MODULE_ID__/campos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN", "OPERADOR"]);
    return __MODULE_ID__Controller.updateField({
      scope,
      id: request.params.id,
      payload: request.body || {},
      reply,
    });
  });

  app.delete("/api/__MODULE_ID__/campos/:id", { preHandler: app.authenticate }, async (request, reply) => {
    const scope = await loadAccessScope(request);
    assertRole(scope, ["ADMIN"]);
    return __MODULE_ID__Controller.removeField({
      scope,
      id: request.params.id,
      reply,
    });
  });

  app.post("/api/__MODULE_ID__/options", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return __MODULE_ID__Controller.listOptions({ scope, payload: request.body || {} });
  });
};

