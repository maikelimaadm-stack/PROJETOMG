import { getPrismaClient } from "../../database/prismaClient.js";

const buildTenantWhere = (clienteId, tenantId) => ({
  cliente_id: clienteId,
  ...(tenantId ? { tenant_id: tenantId } : {}),
});

export const mmmRepository = {
  async findByObjectId({ objectId, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mmmObject.findFirst({
      where: {
        object_id: objectId,
        cliente_id: clienteId,
        status: { not: "deleted" },
      },
    });
  },

  async findByObjectIdIncludingDeleted({ objectId, clienteId }) {
    const prisma = getPrismaClient();
    return prisma.mmmObject.findFirst({
      where: { object_id: objectId, cliente_id: clienteId },
    });
  },

  async list({ clienteId, tenantId, where = {}, cursor, limit = 50 }) {
    const prisma = getPrismaClient();
    const fullWhere = {
      ...buildTenantWhere(clienteId, tenantId),
      status: { not: "deleted" },
      ...where,
    };

    if (cursor) {
      fullWhere.object_id = { gt: cursor };
    }

    const items = await prisma.mmmObject.findMany({
      where: fullWhere,
      orderBy: [{ object_id: "asc" }],
      take: limit + 1,
    });

    const hasMore = items.length > limit;
    const pageItems = hasMore ? items.slice(0, limit) : items;
    const nextCursor = hasMore ? pageItems[pageItems.length - 1]?.object_id : null;

    return { items: pageItems, nextCursor };
  },

  async createWithHistory({ rowData, envelope, reason, actorId }) {
    const prisma = getPrismaClient();
    return prisma.$transaction(async (tx) => {
      const created = await tx.mmmObject.create({ data: rowData });
      await tx.mmmObjectVersion.create({
        data: {
          object_row_id: created.id,
          revision: created.revision,
          envelope,
          reason,
          created_by: actorId ?? null,
        },
      });
      return created;
    });
  },

  async updateWithHistory({ id, rowData, envelope, reason, actorId, auditEntry }) {
    const prisma = getPrismaClient();
    return prisma.$transaction(async (tx) => {
      const updated = await tx.mmmObject.update({ where: { id }, data: rowData });
      await tx.mmmObjectVersion.create({
        data: {
          object_row_id: updated.id,
          revision: updated.revision,
          envelope,
          reason,
          created_by: actorId ?? null,
        },
      });
      if (auditEntry) {
        await tx.mmmObjectAudit.create({ data: auditEntry });
      }
      return updated;
    });
  },

  async createSnapshot({ objectRowId, snapshotId, revision, envelope, integrityHash, reason, actorId }) {
    const prisma = getPrismaClient();
    return prisma.mmmObjectSnapshot.create({
      data: {
        snapshot_id: snapshotId,
        object_row_id: objectRowId,
        revision,
        envelope,
        integrity_hash: integrityHash,
        reason,
        created_by: actorId ?? null,
      },
    });
  },

  async listVersions(objectRowId) {
    const prisma = getPrismaClient();
    return prisma.mmmObjectVersion.findMany({
      where: { object_row_id: objectRowId },
      orderBy: [{ revision: "desc" }],
    });
  },

  async findVersion(objectRowId, revision) {
    const prisma = getPrismaClient();
    return prisma.mmmObjectVersion.findUnique({
      where: { object_row_id_revision: { object_row_id: objectRowId, revision } },
    });
  },

  async listSnapshots(objectRowId) {
    const prisma = getPrismaClient();
    return prisma.mmmObjectSnapshot.findMany({
      where: { object_row_id: objectRowId },
      orderBy: [{ created_at: "desc" }],
    });
  },

  async findSnapshot(snapshotId, objectRowId) {
    const prisma = getPrismaClient();
    return prisma.mmmObjectSnapshot.findFirst({
      where: { snapshot_id: snapshotId, object_row_id: objectRowId },
    });
  },

  async createAudit(entry) {
    const prisma = getPrismaClient();
    return prisma.mmmObjectAudit.create({ data: entry });
  },

  async batchCreateWithHistory(entries) {
    const prisma = getPrismaClient();
    return prisma.$transaction(async (tx) => {
      const createdRows = [];
      for (const entry of entries) {
        const created = await tx.mmmObject.create({ data: entry.rowData });
        await tx.mmmObjectVersion.create({
          data: {
            object_row_id: created.id,
            revision: created.revision,
            envelope: entry.envelope,
            reason: "batch",
            created_by: entry.actorId ?? null,
          },
        });
        createdRows.push(created);
      }
      return createdRows;
    });
  },
};
