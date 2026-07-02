import { getPrismaClient } from "../../../database/prismaClient.js";
import { rowToEnvelope } from "../mmmEnvelopeMapper.js";

const PUBLISHABLE_STATUSES = ["approved", "published", "active"];

export const collectScopeObjects = async ({ clienteId, tenantId, moduleId, applicationId, objectIds }) => {
  const prisma = getPrismaClient();
  const where = {
    cliente_id: clienteId,
    tenant_id: tenantId,
    status: { in: PUBLISHABLE_STATUSES },
  };

  if (moduleId) where.module_id = moduleId;
  if (objectIds?.length) where.object_id = { in: objectIds };

  const rows = await prisma.mmmObject.findMany({
    where,
    orderBy: [{ object_type: "asc" }, { object_id: "asc" }],
  });

  if (applicationId) {
    return rows.filter((row) => {
      const scope = row.scope;
      return !scope?.applicationId || scope.applicationId === applicationId;
    });
  }

  return rows;
};

export const resolveDependencyClosure = (rows) => {
  const byId = new Map(rows.map((row) => [row.object_id, row]));
  const queue = [...rows];
  const visited = new Set(rows.map((row) => row.object_id));
  const violations = [];

  while (queue.length) {
    const row = queue.shift();
    const envelope = rowToEnvelope(row);
    const deps = envelope.dependencies ?? {};
    const refs = [
      ...(deps.possess ?? []),
      ...(deps.use ?? []),
      ...(deps.reference ?? []),
      ...(deps.depend ?? []),
      ...(deps.inherit ?? []).map((item) => item.objectId),
    ];

    for (const refId of refs) {
      if (!refId) continue;
      if (visited.has(refId)) continue;
      violations.push({
        path: `dependencies.${refId}`,
        rule: "BROKEN_REF",
        message: `Unresolved dependency '${refId}' for object ${row.object_id}`,
      });
    }
  }

  return { objects: [...byId.values()], violations };
};

export const markObjectsPublished = async (rows, actorId) => {
  const prisma = getPrismaClient();
  const approvedIds = rows.filter((row) => row.status === "approved").map((row) => row.id);
  if (!approvedIds.length) return [];

  await prisma.mmmObject.updateMany({
    where: { id: { in: approvedIds } },
    data: { status: "published", updated_by: actorId ?? null, updated_at: new Date() },
  });

  return approvedIds;
};
