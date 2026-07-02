export const rowToEnvelope = (row) => ({
  envelopeVersion: row.envelope_version,
  objectId: row.object_id,
  objectType: row.object_type,
  tenantId: row.tenant_id,
  scope: row.scope,
  status: row.status,
  labels: row.labels,
  lineage: row.lineage,
  payload: row.payload,
  dependencies: row.dependencies ?? undefined,
  revision: row.revision,
  createdAt: row.created_at.toISOString(),
  updatedAt: row.updated_at.toISOString(),
  createdBy: row.created_by ?? undefined,
  updatedBy: row.updated_by ?? undefined,
});

export const envelopeToRowData = (envelope, { clienteId, contentHash, actorId, mdpSubstrateRef }) => ({
  object_id: envelope.objectId,
  object_type: envelope.objectType,
  tenant_id: envelope.tenantId,
  cliente_id: clienteId,
  envelope_version: envelope.envelopeVersion,
  scope: envelope.scope,
  status: envelope.status ?? "draft",
  payload: envelope.payload,
  lineage: envelope.lineage,
  dependencies: envelope.dependencies ?? null,
  labels: envelope.labels,
  metadata: envelope.payload?.metadata ?? null,
  revision: envelope.revision ?? 1,
  content_hash: contentHash,
  module_id: envelope.scope?.moduleId ?? null,
  mdp_substrate_ref: mdpSubstrateRef ?? null,
  created_by: envelope.createdBy ?? actorId ?? null,
  updated_by: envelope.updatedBy ?? actorId ?? null,
});

export const auditSnapshot = (row) =>
  row
    ? {
        objectId: row.object_id,
        objectType: row.object_type,
        status: row.status,
        revision: row.revision,
        contentHash: row.content_hash,
      }
    : null;
