import { loadAccessScope } from "../auth/accessScope.js";
import { mdpEntityService } from "./mdpEntityService.js";
import {
  mdpEntityCreateSchema,
  mdpEntityListQuerySchema,
  mdpEntityUpdateSchema,
  parseOrThrow,
} from "./mdpEntityValidators.js";

export const registerMdpRoutes = async (app) => {
  app.get("/api/mdp/entities", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parseOrThrow(mdpEntityListQuerySchema, request.query || {});
    return mdpEntityService.list(query, scope);
  });

  app.get("/api/mdp/entities/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpEntityService.getById(request.params.id, scope);
  });

  app.post("/api/mdp/entities", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseOrThrow(mdpEntityCreateSchema, request.body || {});
    return mdpEntityService.create(payload, scope);
  });

  app.put("/api/mdp/entities/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseOrThrow(mdpEntityUpdateSchema, request.body || {});
    return mdpEntityService.update(request.params.id, payload, scope);
  });

  app.delete("/api/mdp/entities/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpEntityService.remove(request.params.id, scope);
  });
};
