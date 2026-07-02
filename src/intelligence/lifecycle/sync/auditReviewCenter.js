import { buildAuditOperationsRegistry } from "./auditOperationsRegistry.js";
import { buildSyncErrorRegistry } from "./syncErrorRegistry.js";
import { buildSyncRetryRegistry } from "./syncRetryRegistry.js";
import { retrieveSyncState } from "./lifecycleRetrievalSync.js";
import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function buildAuditReviewCenter(groupId) {
  const state = retrieveSyncState(groupId);
  const operations = buildAuditOperationsRegistry(groupId);
  const errors = buildSyncErrorRegistry(groupId);
  const retries = buildSyncRetryRegistry(groupId);

  return Object.freeze({
    groupId,
    available: true,
    headline: "Centro de revisão operacional de ciclo de vida",
    persistedAudits: operations.persistedCount,
    pendingAudits: state.syncRecords.filter((r) => r.entityType === "audit" && r.status === "pending").length,
    failures: errors.failureCount,
    retries: retries.pendingRetries,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export function runAuditOperations(groupId, tenantId, ctx) {
  const registry = buildAuditOperationsRegistry(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    operationsRun: registry.operations.length,
    persistedCount: registry.persistedCount,
    authorized: ctx.authorized === true,
    explainable: true,
    ...SYNC_OWNERSHIP,
  });
}

export default { buildAuditReviewCenter, runAuditOperations };
