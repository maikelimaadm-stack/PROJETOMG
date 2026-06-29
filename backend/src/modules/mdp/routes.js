import { loadAccessScope } from "../auth/accessScope.js";
import { mdpEntityService } from "./mdpEntityService.js";
import { mdpFieldService } from "./mdpFieldService.js";
import { mdpRelationshipService } from "./mdpRelationshipService.js";
import { mdpRegistryService } from "./mdpRegistryService.js";
import { mdpPublishService } from "./mdpPublishService.js";
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
import {
  mdpRelationshipCreateSchema,
  mdpRelationshipListQuerySchema,
  mdpRelationshipUpdateSchema,
  parseOrThrow as parseRelationshipOrThrow,
} from "./mdpRelationshipValidators.js";
import {
  mdpRegistryCreateSchema,
  mdpRegistryIntrospectQuerySchema,
  mdpRegistryListQuerySchema,
  mdpRegistryUpdateSchema,
  parseOrThrow as parseRegistryOrThrow,
} from "./mdpRegistryValidators.js";
import {
  mdpCompileSchema,
  mdpDraftCreateSchema,
  mdpEnvironmentPinListQuerySchema,
  mdpEnvironmentPinSchema,
  mdpIntrospectQuerySchema,
  mdpPublishSchema,
  mdpRollbackSchema,
  mdpSnapshotCreateSchema,
  mdpSnapshotListQuerySchema,
  mdpVersionListQuerySchema,
  parseOrThrow as parsePublishOrThrow,
} from "./mdpPublishValidators.js";

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

  app.get("/api/mdp/relationships", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parseRelationshipOrThrow(mdpRelationshipListQuerySchema, request.query || {});
    return mdpRelationshipService.list(query, scope);
  });

  app.get("/api/mdp/relationships/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpRelationshipService.getById(request.params.id, scope);
  });

  app.post("/api/mdp/relationships", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseRelationshipOrThrow(mdpRelationshipCreateSchema, request.body || {});
    return mdpRelationshipService.create(payload, scope);
  });

  app.put("/api/mdp/relationships/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseRelationshipOrThrow(mdpRelationshipUpdateSchema, request.body || {});
    return mdpRelationshipService.update(request.params.id, payload, scope);
  });

  app.delete("/api/mdp/relationships/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpRelationshipService.remove(request.params.id, scope);
  });

  app.get("/api/mdp/registry/introspect", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parseRegistryOrThrow(mdpRegistryIntrospectQuerySchema, request.query || {});
    return mdpRegistryService.introspect(query, scope);
  });

  app.get("/api/mdp/registry", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parseRegistryOrThrow(mdpRegistryListQuerySchema, request.query || {});
    return mdpRegistryService.list(query, scope);
  });

  app.get("/api/mdp/registry/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpRegistryService.getById(request.params.id, scope);
  });

  app.post("/api/mdp/registry", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseRegistryOrThrow(mdpRegistryCreateSchema, request.body || {});
    return mdpRegistryService.create(payload, scope);
  });

  app.put("/api/mdp/registry/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parseRegistryOrThrow(mdpRegistryUpdateSchema, request.body || {});
    return mdpRegistryService.update(request.params.id, payload, scope);
  });

  app.delete("/api/mdp/registry/:id", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    return mdpRegistryService.remove(request.params.id, scope);
  });

  app.get("/api/mdp/introspect", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parsePublishOrThrow(mdpIntrospectQuerySchema, request.query || {});
    return mdpPublishService.introspect(query, scope);
  });

  app.get("/api/mdp/versions", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parsePublishOrThrow(mdpVersionListQuerySchema, request.query || {});
    return mdpPublishService.listVersions(query, scope);
  });

  app.get("/api/mdp/versions/:id", { preHandler: app.authenticate }, async (request) => {
    return mdpPublishService.getVersion(request.params.id);
  });

  app.post("/api/mdp/versions/draft", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parsePublishOrThrow(mdpDraftCreateSchema, request.body || {});
    return mdpPublishService.createDraft(payload, scope);
  });

  app.post("/api/mdp/publish", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parsePublishOrThrow(mdpPublishSchema, request.body || {});
    return mdpPublishService.publish(payload, scope);
  });

  app.post("/api/mdp/rollback", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parsePublishOrThrow(mdpRollbackSchema, request.body || {});
    return mdpPublishService.rollback(payload, scope);
  });

  app.post("/api/mdp/compile/:moduleId", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const body = parsePublishOrThrow(mdpCompileSchema, request.body || {});
    return mdpPublishService.compile(
      { moduleId: request.params.moduleId, ...body },
      scope
    );
  });

  app.get("/api/mdp/snapshots", { preHandler: app.authenticate }, async (request) => {
    const query = parsePublishOrThrow(mdpSnapshotListQuerySchema, request.query || {});
    return mdpPublishService.listSnapshots(query);
  });

  app.get("/api/mdp/snapshots/:id", { preHandler: app.authenticate }, async (request) => {
    return mdpPublishService.getSnapshot(request.params.id);
  });

  app.post("/api/mdp/snapshots", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parsePublishOrThrow(mdpSnapshotCreateSchema, request.body || {});
    return mdpPublishService.createSnapshot(payload, scope);
  });

  app.get("/api/mdp/environment-pins", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const query = parsePublishOrThrow(mdpEnvironmentPinListQuerySchema, request.query || {});
    return mdpPublishService.listEnvironmentPins(query, scope);
  });

  app.post("/api/mdp/environment-pins", { preHandler: app.authenticate }, async (request) => {
    const scope = await loadAccessScope(request);
    const payload = parsePublishOrThrow(mdpEnvironmentPinSchema, request.body || {});
    return mdpPublishService.pinEnvironment(payload, scope);
  });
};
