import { assembleSyncContext } from "./syncContextAssembly.js";
import { fetchBackendSyncSnapshot, pushSyncBatch, getMemoryBackendSnapshot, seedBackendSnapshot } from "./lifecycleSyncApiClient.js";
import { syncApprovals } from "./approvalSync.js";
import { syncExecutions } from "./executionSync.js";
import { syncStorageActions } from "./storageActionSync.js";
import { syncBackupActions } from "./backupActionSync.js";
import { syncAuditTrail } from "./auditTrailSync.js";
import { syncLifecycleEvents } from "./lifecycleEventSync.js";
import { recordSyncHealth } from "./syncHealthRegistry.js";
import { registerNotificationTrigger } from "./notificationRegistry.js";
import { scheduleSyncRetry } from "./syncRetryRegistry.js";
import { recordSyncMonitoringEvent } from "./syncMonitoringRegistry.js";
import { summarizeLifecycleSync } from "./lifecycleSummariesSync.js";
import { LIFECYCLE_SYNC_VERSION, SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export async function runLifecycleSyncEngine(groupId, tenantId = "default", options = {}) {
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

  const useMemory = options.useMemory ?? typeof fetch === "undefined";
  const clienteId = options.clienteId ?? ctx.clienteId ?? "default-client";
  const fe = ctx.persistenceSnapshot;

  const backend = await fetchBackendSyncSnapshot(groupId, { clienteId, useMemory });

  const approvalResult = syncApprovals(groupId, fe.approvalRequests, backend.approvals ?? []);
  const executionResult = syncExecutions(groupId, fe.executionJobs, backend.executions ?? []);
  const storageResult = syncStorageActions(groupId, tenantId, fe.storageEvents, backend.storageActions ?? []);
  const backupResult = syncBackupActions(groupId, tenantId, fe.backupEvents, backend.backupActions ?? []);
  const auditResult = syncAuditTrail(groupId, tenantId, fe.auditEntries, backend.audits ?? []);
  const eventResult = syncLifecycleEvents(groupId, fe.auditEntries);

  const pendingPush = fe.approvalRequests.filter((r) => r.status === "pending" || r.status === "approved");
  if (pendingPush.length > 0 && options.push !== false) {
    await pushSyncBatch(
      groupId,
      {
        approvals: pendingPush.map((r) => ({
          entityId: r.requestId,
          label: r.label,
          status: r.status,
          actionType: r.actionType,
        })),
        executions: fe.executionJobs.map((j) => ({
          entityId: j.jobId,
          label: j.label,
          status: j.status,
        })),
        audits: fe.auditEntries.slice(0, 20).map((a) => ({
          auditId: a.auditId,
          action: a.action,
          recordedAt: a.recordedAt,
        })),
      },
      { clienteId, useMemory }
    );
  }

  if (approvalResult.diverged > 0) {
    registerNotificationTrigger(groupId, tenantId, {
      triggerType: "divergence_detected",
      label: "Divergência de sincronização",
      summary: `${approvalResult.diverged} aprovação(ões) com estado divergente.`,
      scopeAuthorized: true,
    });
    scheduleSyncRetry(groupId, tenantId, {
      entityType: "approval",
      label: "Reprocessar aprovações divergentes",
      summary: "Retry automático com trilha.",
    });
  }

  if (approvalResult.pending > 0) {
    registerNotificationTrigger(groupId, tenantId, {
      triggerType: "approval_pending",
      label: "Aprovações aguardando backend",
      summary: `${approvalResult.pending} item(ns) pendente(s).`,
      scopeAuthorized: true,
    });
  }

  recordSyncMonitoringEvent(groupId, tenantId, {
    eventType: "sync_completed",
    label: "Sincronização concluída",
    summary: summarizeLifecycleSync(groupId).headline,
  });

  const health = recordSyncHealth(groupId, tenantId, { backendConnected: backend.source !== "memory_backend_empty" });
  const summary = summarizeLifecycleSync(groupId);

  return Object.freeze({
    groupId,
    tenantId,
    authorized: true,
    engineVersion: LIFECYCLE_SYNC_VERSION,
    analyzedAt: new Date().toISOString(),
    approvalResult,
    executionResult,
    storageResult,
    backupResult,
    auditResult,
    eventResult,
    health,
    summary,
    backendSource: backend.source,
    durable: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export function runLifecycleSyncEngineSync(groupId, tenantId = "default", options = {}) {
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

  const clienteId = options.clienteId ?? ctx.clienteId ?? "default-client";
  const fe = ctx.persistenceSnapshot;
  const backend = getMemoryBackendSnapshot(clienteId, groupId);

  const approvalResult = syncApprovals(groupId, fe.approvalRequests, backend.approvals ?? []);
  const executionResult = syncExecutions(groupId, fe.executionJobs, backend.executions ?? []);
  const storageResult = syncStorageActions(groupId, tenantId, fe.storageEvents, backend.storageActions ?? []);
  const backupResult = syncBackupActions(groupId, tenantId, fe.backupEvents, backend.backupActions ?? []);
  const auditResult = syncAuditTrail(groupId, tenantId, fe.auditEntries, backend.audits ?? []);

  if (options.push !== false && fe.approvalRequests.length > 0) {
    seedBackendSnapshot(clienteId, groupId, {
      approvals: fe.approvalRequests.map((r) => ({
        entityId: r.requestId,
        label: r.label,
        status: r.status,
        actionType: r.actionType,
      })),
      executions: fe.executionJobs.map((j) => ({ entityId: j.jobId, label: j.label, status: j.status })),
      audits: fe.auditEntries.slice(0, 20).map((a) => ({ auditId: a.auditId, action: a.action })),
      storageActions: storageResult.actions ?? [],
      backupActions: backupResult.actions ?? [],
    });
  }

  if (approvalResult.diverged > 0) {
    registerNotificationTrigger(groupId, tenantId, {
      triggerType: "divergence_detected",
      label: "Divergência de sincronização",
      summary: `${approvalResult.diverged} aprovação(ões) divergente(s).`,
      scopeAuthorized: true,
    });
  }

  recordSyncMonitoringEvent(groupId, tenantId, {
    eventType: "sync_completed",
    label: "Sincronização concluída",
    summary: summarizeLifecycleSync(groupId).headline,
  });

  const health = recordSyncHealth(groupId, tenantId);
  const summary = summarizeLifecycleSync(groupId);

  return Object.freeze({
    groupId,
    tenantId,
    authorized: true,
    engineVersion: LIFECYCLE_SYNC_VERSION,
    approvalResult,
    executionResult,
    storageResult,
    backupResult,
    auditResult,
    health,
    summary,
    backendSource: "memory_backend_sync",
    durable: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default runLifecycleSyncEngine;
