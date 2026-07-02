import { randomUUID } from "node:crypto";
import { getMmmSchemaRegistry, getManifestSummary, getSchemaForObjectType } from "./mmmSchemaRegistry.js";
import { validateMmmEnvelope, MmmValidationError } from "./mmmValidator.js";
import { assertLifecycleTransition, assertNotDirectPublish } from "./mmmLifecycle.js";
import {
  hashEnvelopeContent,
  hashSnapshotEnvelope,
  buildSnapshotId,
  MMM_ENVELOPE_VERSION,
} from "./mmmConstants.js";
import { rowToEnvelope, envelopeToRowData, auditSnapshot } from "./mmmEnvelopeMapper.js";
import { buildMdpSubstrateRef } from "./mmmSubstrateBridge.js";
import { mmmRepository } from "./mmmRepository.js";

const withStatus = (message, statusCode, code = "ERROR") => {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.code = code;
  throw error;
};

const resolveTenantId = (scope, tenantId) => {
  const resolved = tenantId || scope.clienteId;
  return String(resolved);
};

const normalizeCreateEnvelope = (input, tenantId) => {
  const now = new Date().toISOString();
  return {
    envelopeVersion: MMM_ENVELOPE_VERSION,
    objectId: input.objectId || randomUUID(),
    objectType: input.objectType,
    tenantId,
    scope: input.scope,
    status: "draft",
    labels: input.labels,
    lineage: input.lineage,
    payload: input.payload,
    dependencies: input.dependencies,
    revision: 1,
    createdAt: now,
    updatedAt: now,
    createdBy: input.createdBy,
    updatedBy: input.updatedBy,
  };
};

const prepareEnvelopeUpdate = (existing, patch, actorId) => {
  const now = new Date().toISOString();
  const nextRevision = existing.revision + 1;
  return {
    envelopeVersion: existing.envelope_version,
    objectId: existing.object_id,
    objectType: existing.object_type,
    tenantId: existing.tenant_id,
    scope: patch.scope ?? existing.scope,
    status: patch.status ?? existing.status,
    labels: patch.labels ?? existing.labels,
    lineage: patch.lineage ?? existing.lineage,
    payload: patch.payload ?? existing.payload,
    dependencies: patch.dependencies ?? existing.dependencies ?? undefined,
    revision: nextRevision,
    createdAt: existing.created_at.toISOString(),
    updatedAt: now,
    createdBy: existing.created_by ?? undefined,
    updatedBy: actorId ?? patch.updatedBy,
  };
};

export const mmmService = {
  async listSchemas() {
    return getManifestSummary();
  },

  async getSchema(objectType) {
    const schema = await getSchemaForObjectType(objectType);
    if (!schema) withStatus("Schema not found.", 404, "NOT_FOUND");
    return schema;
  },

  async listObjects(query, scope) {
    const tenantId = resolveTenantId(scope, query.tenantId);
    if (query.tenantId && query.tenantId !== scope.clienteId) {
      withStatus("tenantId forbidden for authenticated scope.", 403, "TENANT_FORBIDDEN");
    }

    const where = {};
    if (query.objectType) where.object_type = query.objectType;
    if (query.moduleId) where.module_id = query.moduleId;
    if (query.status) where.status = query.status;

    const { items, nextCursor } = await mmmRepository.list({
      clienteId: scope.clienteId,
      tenantId,
      where,
      cursor: query.cursor,
      limit: query.limit ?? 50,
    });

    return {
      items: items.map(rowToEnvelope),
      nextCursor,
    };
  },

  async getObject(objectId, scope) {
    const row = await mmmRepository.findByObjectId({
      objectId,
      clienteId: scope.clienteId,
    });
    if (!row) withStatus("Object not found.", 404, "NOT_FOUND");
    return rowToEnvelope(row);
  },

  async createObject(input, scope) {
    const registry = await getMmmSchemaRegistry();
    const tenantId = resolveTenantId(scope, input.tenantId);
    const envelope = normalizeCreateEnvelope(input, tenantId);
    const actorId = scope.login ?? scope.userId ?? null;

    await validateMmmEnvelope({
      envelope,
      registry,
      mode: "create",
      tenantId,
    });

    const contentHash = hashEnvelopeContent(envelope.payload, envelope.objectType, envelope.revision);
    const mdpSubstrateRef = buildMdpSubstrateRef({
      objectType: envelope.objectType,
      moduleId: envelope.scope?.moduleId,
      scope: envelope.scope,
    });

    const row = await mmmRepository.createWithHistory({
      rowData: envelopeToRowData(envelope, { clienteId: scope.clienteId, contentHash, actorId, mdpSubstrateRef }),
      envelope,
      reason: "create",
      actorId,
    });

    return rowToEnvelope(row);
  },

  async replaceObject(objectId, input, scope) {
    const existing = await mmmRepository.findByObjectId({
      objectId,
      clienteId: scope.clienteId,
    });
    if (!existing) withStatus("Object not found.", 404, "NOT_FOUND");

    if (input.objectId && input.objectId !== objectId) {
      withStatus("objectId is immutable.", 422, "ENVELOPE_INVALID");
    }
    if (input.objectType && input.objectType !== existing.object_type) {
      withStatus("objectType is immutable after create.", 422, "ENVELOPE_INVALID");
    }

    const registry = await getMmmSchemaRegistry();
    const tenantId = existing.tenant_id;
    const actorId = scope.login ?? scope.userId ?? null;
    const envelope = {
      ...input,
      envelopeVersion: MMM_ENVELOPE_VERSION,
      objectId,
      objectType: existing.object_type,
      tenantId,
      revision: input.revision,
      updatedAt: new Date().toISOString(),
      createdAt: existing.created_at.toISOString(),
      updatedBy: actorId ?? input.updatedBy,
      createdBy: existing.created_by ?? input.createdBy,
    };

    if (envelope.revision !== existing.revision) {
      withStatus("Revision conflict.", 409, "REVISION_CONFLICT");
    }

    assertLifecycleTransition(existing.status, envelope.status ?? existing.status);
    assertNotDirectPublish(envelope.status);

    await validateMmmEnvelope({
      envelope,
      registry,
      mode: "update",
      expectedRevision: existing.revision,
      tenantId,
    });

    const nextRevision = existing.revision + 1;
    envelope.revision = nextRevision;

    const contentHash = hashEnvelopeContent(envelope.payload, envelope.objectType, envelope.revision);
    const row = await mmmRepository.updateWithHistory({
      id: existing.id,
      rowData: envelopeToRowData(envelope, {
        clienteId: scope.clienteId,
        contentHash,
        actorId,
        mdpSubstrateRef: existing.mdp_substrate_ref,
      }),
      envelope,
      reason: "update",
      actorId,
      auditEntry: {
        object_row_id: existing.id,
        cliente_id: scope.clienteId,
        action: "replace",
        before: auditSnapshot(existing),
        after: { objectId, revision: nextRevision, status: envelope.status },
        usuario_id: scope.userId ?? null,
      },
    });

    return rowToEnvelope(row);
  },

  async patchObject(objectId, patch, scope) {
    const existing = await mmmRepository.findByObjectId({
      objectId,
      clienteId: scope.clienteId,
    });
    if (!existing) withStatus("Object not found.", 404, "NOT_FOUND");

    if (patch.revision != null && patch.revision !== existing.revision) {
      withStatus("Revision conflict.", 409, "REVISION_CONFLICT");
    }

    const actorId = scope.login ?? scope.userId ?? null;
    const envelope = prepareEnvelopeUpdate(existing, patch, actorId);

    if (patch.status) {
      assertLifecycleTransition(existing.status, patch.status);
      assertNotDirectPublish(patch.status);
    }

    const registry = await getMmmSchemaRegistry();
    await validateMmmEnvelope({
      envelope,
      registry,
      mode: "update",
      expectedRevision: existing.revision,
      tenantId: existing.tenant_id,
    });

    const contentHash = hashEnvelopeContent(envelope.payload, envelope.objectType, envelope.revision);
    const row = await mmmRepository.updateWithHistory({
      id: existing.id,
      rowData: envelopeToRowData(envelope, {
        clienteId: scope.clienteId,
        contentHash,
        actorId,
        mdpSubstrateRef: existing.mdp_substrate_ref,
      }),
      envelope,
      reason: "update",
      actorId,
      auditEntry: {
        object_row_id: existing.id,
        cliente_id: scope.clienteId,
        action: "patch",
        before: auditSnapshot(existing),
        after: { objectId, revision: envelope.revision, status: envelope.status },
        usuario_id: scope.userId ?? null,
      },
    });

    return rowToEnvelope(row);
  },

  async deleteObject(objectId, scope) {
    const existing = await mmmRepository.findByObjectId({
      objectId,
      clienteId: scope.clienteId,
    });
    if (!existing) withStatus("Object not found.", 404, "NOT_FOUND");
    assertLifecycleTransition(existing.status, "deleted");
    return this.patchObject(objectId, { revision: existing.revision, status: "deleted" }, scope);
  },

  async batchCreateObjects(body, scope) {
    if (!body?.objects?.length) withStatus("Batch requires at least one object.", 422, "VALIDATION_ERROR");
    const registry = await getMmmSchemaRegistry();
    const actorId = scope.login ?? scope.userId ?? null;
    const prepared = [];

    for (const input of body.objects) {
      const tenantId = resolveTenantId(scope, input.tenantId);
      const envelope = normalizeCreateEnvelope(input, tenantId);
      await validateMmmEnvelope({ envelope, registry, mode: "create", tenantId });
      const contentHash = hashEnvelopeContent(envelope.payload, envelope.objectType, envelope.revision);
      prepared.push({
        envelope,
        actorId,
        rowData: envelopeToRowData(envelope, {
          clienteId: scope.clienteId,
          contentHash,
          actorId,
          mdpSubstrateRef: buildMdpSubstrateRef({
            objectType: envelope.objectType,
            moduleId: envelope.scope?.moduleId,
            scope: envelope.scope,
          }),
        }),
      });
    }

    const rows = await mmmRepository.batchCreateWithHistory(prepared);
    return { items: rows.map(rowToEnvelope), derivationPlanId: body.derivationPlanId };
  },

  async listVersions(objectId, scope) {
    const row = await mmmRepository.findByObjectId({ objectId, clienteId: scope.clienteId });
    if (!row) withStatus("Object not found.", 404, "NOT_FOUND");
    const versions = await mmmRepository.listVersions(row.id);
    return versions.map((version) => ({
      revision: version.revision,
      reason: version.reason,
      createdAt: version.created_at.toISOString(),
      createdBy: version.created_by ?? undefined,
      envelope: version.envelope,
    }));
  },

  async createSnapshot(objectId, scope) {
    const row = await mmmRepository.findByObjectId({ objectId, clienteId: scope.clienteId });
    if (!row) withStatus("Object not found.", 404, "NOT_FOUND");
    const envelope = rowToEnvelope(row);
    const integrityHash = hashSnapshotEnvelope(envelope);
    const snapshotId = buildSnapshotId(objectId, row.revision);
    const snapshot = await mmmRepository.createSnapshot({
      objectRowId: row.id,
      snapshotId,
      revision: row.revision,
      envelope,
      integrityHash,
      reason: "update",
      actorId: scope.login ?? scope.userId ?? null,
    });
    return {
      snapshotId: snapshot.snapshot_id,
      revision: snapshot.revision,
      integrityHash: snapshot.integrity_hash,
      createdAt: snapshot.created_at.toISOString(),
    };
  },

  async rollbackObject(objectId, { revision, snapshotId }, scope) {
    const row = await mmmRepository.findByObjectId({ objectId, clienteId: scope.clienteId });
    if (!row) withStatus("Object not found.", 404, "NOT_FOUND");

    let sourceEnvelope;
    if (snapshotId) {
      const snapshot = await mmmRepository.findSnapshot(snapshotId, row.id);
      if (!snapshot) withStatus("Snapshot not found.", 404, "NOT_FOUND");
      sourceEnvelope = snapshot.envelope;
    } else if (revision != null) {
      const version = await mmmRepository.findVersion(row.id, revision);
      if (!version) withStatus("Version not found.", 404, "NOT_FOUND");
      sourceEnvelope = version.envelope;
    } else {
      withStatus("revision or snapshotId required.", 422, "VALIDATION_ERROR");
    }

    const actorId = scope.login ?? scope.userId ?? null;
    const envelope = {
      ...sourceEnvelope,
      objectId,
      revision: row.revision + 1,
      updatedAt: new Date().toISOString(),
      updatedBy: actorId,
      status: sourceEnvelope.status === "deleted" ? "draft" : sourceEnvelope.status,
    };

    const registry = await getMmmSchemaRegistry();
    await validateMmmEnvelope({
      envelope,
      registry,
      mode: "update",
      tenantId: row.tenant_id,
      allowPublishTransition: false,
    });

    const contentHash = hashEnvelopeContent(envelope.payload, envelope.objectType, envelope.revision);
    const updated = await mmmRepository.updateWithHistory({
      id: row.id,
      rowData: envelopeToRowData(envelope, {
        clienteId: scope.clienteId,
        contentHash,
        actorId,
        mdpSubstrateRef: row.mdp_substrate_ref,
      }),
      envelope,
      reason: "rollback",
      actorId,
      auditEntry: {
        object_row_id: row.id,
        cliente_id: scope.clienteId,
        action: "rollback",
        before: auditSnapshot(row),
        after: { objectId, revision: envelope.revision, fromRevision: revision, snapshotId },
        usuario_id: scope.userId ?? null,
      },
    });

    return rowToEnvelope(updated);
  },

  async requestPublish(body) {
    return {
      accepted: true,
      status: "queued",
      message: "Publish scope accepted — full Publish Engine deferred to Program 4.04",
      tenantId: body?.tenantId,
      environment: body?.environment,
    };
  },

  formatValidationError(error) {
    if (error instanceof MmmValidationError) {
      return {
        code: error.code,
        message: error.message,
        violations: error.violations,
      };
    }
    return {
      code: error.code || "ERROR",
      message: error.message,
    };
  },
};
