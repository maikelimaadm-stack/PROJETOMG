import { appendBackupEvent } from "./durableLifecycleStore.js";

export function recordBackupIntegration(groupId, tenantId, partial = {}) {
  return appendBackupEvent(
    Object.freeze({
      groupId,
      tenantId,
      label: "Integração com backup",
      summary: partial.summary ?? `Backup ${partial.status ?? "scheduled"} antes de ${partial.actionType ?? "lifecycle"}.`,
      actionType: partial.actionType ?? "archive",
      requestId: partial.requestId ?? null,
      status: partial.status ?? "snapshot_scheduled",
      backupSnapshot: partial.backupSnapshot ?? `snapshot-${groupId}-${Date.now()}`,
      explainable: true,
    })
  );
}

export default recordBackupIntegration;
