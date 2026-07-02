/**
 * Persistence → Sync ingestion.
 * @see Program 3.27
 */
import { assembleSyncContext } from "./syncContextAssembly.js";
import { runLifecycleSyncEngineSync } from "./lifecycleSyncEngine.js";
import { buildSyncDocument } from "./syncDocument.js";
import { buildAuditReviewCenter } from "./auditReviewCenter.js";
import { LIFECYCLE_SYNC_VERSION, SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";
import { appendMonitoringEvent } from "./durabilitySyncStore.js";

export function analyzeLifecycleSyncContext(groupId, tenantId = "default", options = {}) {
  const ctx = assembleSyncContext(groupId, tenantId, options);
  if (!ctx.authorized) {
    return Object.freeze({
      groupId,
      tenantId,
      authorized: false,
      reason: ctx.reason,
      ...SYNC_OWNERSHIP,
    });
  }

  const syncResult = runLifecycleSyncEngineSync(groupId, tenantId, options);
  const reviewCenter = buildAuditReviewCenter(groupId);
  const syncDoc = buildSyncDocument(groupId, ctx, syncResult.summary);

  appendMonitoringEvent({
    groupId,
    tenantId,
    eventType: "sync_ingested",
    label: "Sincronização ingerida",
    summary: syncResult.summary?.headline ?? "Pipeline de sync executado.",
  });

  return Object.freeze({
    groupId,
    tenantId,
    analyzedAt: new Date().toISOString(),
    authorized: true,
    engineVersion: LIFECYCLE_SYNC_VERSION,
    syncResult,
    reviewCenter,
    syncDoc,
    durable: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export function ingestPersistenceToSync(groupId, tenantId = "default", options = {}) {
  return analyzeLifecycleSyncContext(groupId, tenantId, options);
}

export default { analyzeLifecycleSyncContext, ingestPersistenceToSync };
