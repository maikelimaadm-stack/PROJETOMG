import { loadAccessScope } from "../auth/accessScope.js";
import { mdpEntityService } from "./mdpEntityService.js";
import { mdpFieldService } from "./mdpFieldService.js";
import {
  mdpEntityCreateSchema,
  mdpEntityListQuerySchema,
  mdpEntityUpdateSchema,
  parseOrThrow as parseEntityOrThrow,
} from "./mdpEntityValidators.js";
import {
  mdpFieldCreateSchema,
  mdpFieldListQuerySchema,
  mdpFieldUpdateSchema,
  parseOrThrow as parseFieldOrThrow,
} from "./mdpFieldValidators.js";

export const registerMdpRoutes = async (app) => {
  app.get("/api/mdp/entities", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parseEntityOrThrow(mdpEntityListQuerySchema, request.query || {});
    return mdpEntityService.list(query, scope);
  });

  app.get("/api/mdp/entities/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpEntityService.getById(request.params.id, scope);
  });

  app.post("/api/mdp/entities", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseEntityOrThrow(mdpEntityCreateSchema, request.body || {});
    return mdpEntityService.create(payload, scope);
  });

  app.put("/api/mdp/entities/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseEntityOrThrow(mdpEntityUpdateSchema, request.body || {});
    return mdpEntityService.update(request.params.id, payload, scope);
  });

  app.delete("/api/mdp/entities/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpEntityService.remove(request.params.id, scope);
  });

  app.get("/api/mdp/fields", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parseFieldOrThrow(mdpFieldListQuerySchema, request.query || {});
    return mdpFieldService.list(query, scope);
  });

  app.get("/api/mdp/fields/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpFieldService.getById(request.params.id, scope);
  });

  app.post("/api/mdp/fields", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseFieldOrThrow(mdpFieldCreateSchema, request.body || {});
    return mdpFieldService.create(payload, scope);
  });

  app.put("/api/mdp/fields/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseFieldOrThrow(mdpFieldUpdateSchema, request.body || {});
    return mdpFieldService.update(request.params.id, payload, scope);
  });

  app.delete("/api/mdp/fields/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpFieldService.remove(request.params.id, scope);
  });
};
