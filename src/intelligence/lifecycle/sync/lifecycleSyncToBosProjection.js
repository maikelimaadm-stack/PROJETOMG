/**
 * Lifecycle Sync → BOS projection — business vocabulary only.
 * @see Program 3.27
 */
import { summarizeLifecycleSync } from "./lifecycleSummariesSync.js";
import { retrieveSyncState } from "./lifecycleRetrievalSync.js";
import { buildSyncHealthRegistry } from "./syncHealthRegistry.js";
import { buildSyncErrorRegistry } from "./syncErrorRegistry.js";
import { buildSyncRetryRegistry } from "./syncRetryRegistry.js";
import { buildNotificationRegistry } from "./notificationRegistry.js";
import { buildAuditReviewCenter } from "./auditReviewCenter.js";
import { explainSyncState } from "./lifecycleExplainabilitySync.js";

export function buildLifecycleSyncBosProjection(groupId, tenantId = "default", options = {}) {
  if (!groupId) {
    return Object.freeze({
      hasSync: false,
      authorized: false,
      summary: "Sincronização requer escopo autorizado.",
      explainable: true,
    });
  }

  const summary = summarizeLifecycleSync(groupId);
  const state = retrieveSyncState(groupId);
  const health = buildSyncHealthRegistry(groupId);
  const errors = buildSyncErrorRegistry(groupId);
  const retries = buildSyncRetryRegistry(groupId);
  const notifications = buildNotificationRegistry(groupId);
  const reviewCenter = buildAuditReviewCenter(groupId);
  const explanation = explainSyncState(groupId);

  const syncStatus = Object.freeze({
    label: health.status === "healthy" ? "Sincronizado" : health.status === "degraded" ? "Divergência detectada" : "Em sincronização",
    context: summary.headline,
    because: explanation.because,
  });

  const syncedApprovals = state.syncRecords
    .filter((r) => r.entityType === "approval" && r.status === "synced")
    .slice(0, 8)
    .map((r) => Object.freeze({ id: r.entityId, label: r.label, context: r.summary, status: r.status }));

  const pendingExecutions = state.syncRecords
    .filter((r) => r.entityType === "execution" && r.status === "pending")
    .slice(0, 8)
    .map((r) => Object.freeze({ id: r.entityId, label: r.label, context: r.summary, status: r.status }));

  const divergences = state.syncRecords
    .filter((r) => r.status === "diverged")
    .slice(0, 8)
    .map((r) => Object.freeze({ id: r.entityId, label: r.label, context: r.summary, because: explanation.because }));

  const storageConfirmed = state.storageActions
    .filter((a) => a.status === "confirmed")
    .slice(0, 5)
    .map((a) => Object.freeze({ id: a.actionId, label: a.label, context: a.summary, status: a.status }));

  const backupsTriggered = state.backupActions
    .slice(0, 5)
    .map((a) => Object.freeze({ id: a.actionId, label: a.label, context: a.summary, status: a.status }));

  const persistedAudits = state.syncRecords
    .filter((r) => r.entityType === "audit" && r.status === "synced")
    .slice(0, 8)
    .map((r) => Object.freeze({ id: r.entityId, label: r.label, context: r.summary }));

  const syncFailures = errors.errors.slice(0, 5);
  const syncRetries = retries.retries.filter((r) => r.status !== "completed").slice(0, 5);
  const adminAlerts = notifications.notifications.filter((n) => !n.delivered).slice(0, 5);

  return Object.freeze({
    hasSync: true,
    authorized: true,
    summary: summary.headline,
    durable: true,
    syncStatus,
    syncedApprovals,
    pendingExecutions,
    divergences,
    storageConfirmed,
    backupsTriggered,
    persistedAudits,
    syncFailures,
    syncRetries,
    adminAlerts,
    lifecycleNotifications: notifications.notifications.slice(0, 8),
    reviewCenter: reviewCenter.available
      ? Object.freeze({
          label: reviewCenter.headline,
          context: `${reviewCenter.persistedAudits} auditorias persistidas, ${reviewCenter.failures} falha(s), ${reviewCenter.retries} retry(s).`,
          because: "Centro de revisão operacional protege histórico e conformidade.",
        })
      : null,
    integrationHealth: Object.freeze({
      label: "Saúde da integração",
      context: health.headline,
      backendConnected: state.health?.backendConnected ?? true,
      storageConnected: state.health?.storageConnected ?? true,
    }),
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildLifecycleSyncBosProjection;
