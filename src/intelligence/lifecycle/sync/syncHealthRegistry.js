import { upsertHealthSnapshot } from "./durabilitySyncStore.js";
import { summarizeLifecycleSync } from "./lifecycleSummariesSync.js";

export function recordSyncHealth(groupId, tenantId, partial = {}) {
  const summary = summarizeLifecycleSync(groupId);
  const status =
    summary.divergedCount > 0 ? "degraded" : summary.errorCount > 0 ? "warning" : summary.pendingCount > 0 ? "syncing" : "healthy";

  const snapshot = upsertHealthSnapshot(
    Object.freeze({
      healthId: `lhealth-${groupId}`,
      groupId,
      tenantId,
      status,
      headline: summary.headline,
      syncedCount: summary.syncedCount,
      divergedCount: summary.divergedCount,
      pendingCount: summary.pendingCount,
      backendConnected: partial.backendConnected ?? true,
      storageConnected: partial.storageConnected ?? true,
      recordedAt: new Date().toISOString(),
    })
  );

  return Object.freeze({ snapshot, explainable: true });
}

export function buildSyncHealthRegistry(groupId) {
  const summary = summarizeLifecycleSync(groupId);
  return Object.freeze({
    groupId,
    status: summary.healthStatus,
    headline: summary.headline,
    syncedCount: summary.syncedCount,
    divergedCount: summary.divergedCount,
    explainable: true,
  });
}

export default { recordSyncHealth, buildSyncHealthRegistry };
