import { loadAccessScope } from "../auth/accessScope.js";
import { mmmService } from "./mmmService.js";
import {
  mmmBatchCreateSchema,
  mmmEnvelopeCreateSchema,
  mmmEnvelopePatchSchema,
  mmmEnvelopeReplaceSchema,
  mmmListQuerySchema,
  mmmPublishSchema,
  mmmRollbackSchema,
  parseOrThrow,
} from "./mmmValidators.js";

const handleError = (reply, error) => {
  const statusCode = error.statusCode || 500;
  if (statusCode === 422 && error.violations) {
    return reply.code(422).send(mmmService.formatValidationError(error));
  }
  if (statusCode === 422 && error.code) {
    return reply.code(422).send({ code: error.code, message: error.message });
  }
  return reply.code(statusCode).send({
    code: error.code || "ERROR",
    message: error.message || "Unexpected error",
  });
};

export const registerMmmRoutes = async (app) => {
  app.get("/api/mmm/v1/schemas", { preHandler: app.authenticate }, async (_request, reply) => {
    try {
      return await mmmService.listSchemas();
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.get("/api/mmm/v1/schemas/:objectType", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      return await mmmService.getSchema(request.params.objectType);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.get("/api/mmm/v1/objects", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      const query = parseOrThrow(mmmListQuerySchema, request.query || {});
      return await mmmService.listObjects(query, scope);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post("/api/mmm/v1/objects", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      const payload = parseOrThrow(mmmEnvelopeCreateSchema, request.body || {});
      const created = await mmmService.createObject(payload, scope);
      return reply.code(201).send(created);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.get("/api/mmm/v1/objects/:objectId", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      return await mmmService.getObject(request.params.objectId, scope);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.put("/api/mmm/v1/objects/:objectId", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      const payload = parseOrThrow(mmmEnvelopeReplaceSchema, request.body || {});
      return await mmmService.replaceObject(request.params.objectId, payload, scope);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.patch("/api/mmm/v1/objects/:objectId", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      const payload = parseOrThrow(mmmEnvelopePatchSchema, request.body || {});
      return await mmmService.patchObject(request.params.objectId, payload, scope);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.delete("/api/mmm/v1/objects/:objectId", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      await mmmService.deleteObject(request.params.objectId, scope);
      return reply.code(204).send();
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post("/api/mmm/v1/objects/batch", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      const payload = parseOrThrow(mmmBatchCreateSchema, request.body || {});
      const result = await mmmService.batchCreateObjects(payload, scope);
      return reply.code(201).send(result);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post("/api/mmm/v1/publish", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const payload = parseOrThrow(mmmPublishSchema, request.body || {});
      const result = await mmmService.requestPublish(payload);
      return reply.code(202).send(result);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.get("/api/mmm/v1/objects/:objectId/versions", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      return await mmmService.listVersions(request.params.objectId, scope);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post("/api/mmm/v1/objects/:objectId/snapshots", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      return await mmmService.createSnapshot(request.params.objectId, scope);
    } catch (error) {
      return handleError(reply, error);
    }
  });

  app.post("/api/mmm/v1/objects/:objectId/rollback", { preHandler: app.authenticate }, async (request, reply) => {
    try {
      const scope = await loadAccessScope(request);
      const payload = parseOrThrow(mmmRollbackSchema, request.body || {});
      return await mmmService.rollbackObject(request.params.objectId, payload, scope);
    } catch (error) {
      return handleError(reply, error);
    }
  });
};

export default registerMmmRoutes;
