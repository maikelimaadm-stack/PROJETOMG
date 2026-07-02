import { listSyncRecords } from "./durabilitySyncStore.js";
import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function buildAuditOperationsRegistry(groupId) {
  const records = listSyncRecords(groupId, { limit: 50 }).filter((r) => r.entityType === "audit");
  return Object.freeze({
    groupId,
    operations: records.map((r) =>
      Object.freeze({
        id: r.syncId,
        label: r.label ?? r.entityType,
        status: r.status,
        context: r.summary ?? "",
      })
    ),
    persistedCount: records.filter((r) => r.status === "synced").length,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default buildAuditOperationsRegistry;
