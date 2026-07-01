import { appendStorageEvent } from "./durableLifecycleStore.js";

export function recordStorageIntegration(groupId, tenantId, partial = {}) {
  return appendStorageEvent(
    Object.freeze({
      groupId,
      tenantId,
      label: "Integração com storage",
      summary: partial.summary ?? `Storage ${partial.status ?? "scheduled"} para ${partial.actionType ?? "lifecycle"}.`,
      actionType: partial.actionType ?? "archive",
      requestId: partial.requestId ?? null,
      status: partial.status ?? "scheduled",
      storageTarget: partial.storageTarget ?? "tenant-archive",
      explainable: true,
    })
  );
}

export default recordStorageIntegration;
