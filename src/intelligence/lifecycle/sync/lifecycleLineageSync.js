import { listSyncRecords } from "./durabilitySyncStore.js";

export function buildSyncLineage(groupId) {
  const records = listSyncRecords(groupId, { limit: 30 });
  return Object.freeze({
    groupId,
    lineage: records.map((r) =>
      Object.freeze({
        id: r.syncId,
        entityType: r.entityType,
        entityId: r.entityId,
        status: r.status,
        recordedAt: r.recordedAt ?? null,
      })
    ),
    explainable: true,
  });
}

export default buildSyncLineage;
