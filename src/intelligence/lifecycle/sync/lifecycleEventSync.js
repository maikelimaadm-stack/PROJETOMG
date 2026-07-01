import { listSyncRecords, listSyncErrors } from "./durabilitySyncStore.js";

export function syncLifecycleEvents(groupId, frontendEvents = []) {
  const syncRecords = listSyncRecords(groupId, { limit: 100 });
  return Object.freeze({
    groupId,
    eventCount: frontendEvents.length,
    syncedEvents: syncRecords.filter((r) => r.status === "synced").length,
    explainable: true,
  });
}

export function explainSyncState(groupId) {
  const errors = listSyncErrors(groupId, { limit: 10 });
  const records = listSyncRecords(groupId, { limit: 50 });
  const diverged = records.filter((r) => r.status === "diverged");

  return Object.freeze({
    groupId,
    because:
      diverged.length > 0
        ? `${diverged.length} item(ns) com divergência entre frontend e backend.`
        : errors.length > 0
          ? `${errors.length} falha(s) de sincronização registrada(s).`
          : "Frontend e backend alinhados.",
    divergedCount: diverged.length,
    errorCount: errors.length,
    explainable: true,
  });
}

export default { syncLifecycleEvents, explainSyncState };
