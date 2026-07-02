import { appendSyncRetry, listSyncRetries } from "./durabilitySyncStore.js";
import { appendMonitoringEvent } from "./durabilitySyncStore.js";

export function scheduleSyncRetry(groupId, tenantId, partial = {}) {
  const retry = appendSyncRetry(
    Object.freeze({
      groupId,
      tenantId,
      entityType: partial.entityType ?? "sync",
      entityId: partial.entityId ?? null,
      label: partial.label ?? "Reprocessamento de sincronização",
      summary: partial.summary ?? "Retry agendado com rastreabilidade.",
      status: "scheduled",
      attempt: (partial.attempt ?? 0) + 1,
      maxAttempts: partial.maxAttempts ?? 3,
    })
  );

  appendMonitoringEvent({
    groupId,
    tenantId,
    eventType: "retry_scheduled",
    label: "Retry agendado",
    summary: retry.summary,
  });

  return Object.freeze({ scheduled: true, retry, explainable: true });
}

export function buildSyncRetryRegistry(groupId) {
  const retries = listSyncRetries(groupId, { limit: 30 });
  return Object.freeze({
    groupId,
    retries: retries.map((r) =>
      Object.freeze({
        id: r.retryId,
        label: r.label,
        context: r.summary,
        status: r.status,
        attempt: r.attempt,
      })
    ),
    pendingRetries: retries.filter((r) => r.status !== "completed").length,
    explainable: true,
  });
}

export default { scheduleSyncRetry, buildSyncRetryRegistry };
