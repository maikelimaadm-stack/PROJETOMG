import { appendBackupAction } from "./durabilitySyncStore.js";
import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function executeBackupSync(groupId, tenantId, partial = {}) {
  if (!partial.policyValid && partial.policyValid !== undefined) {
    return Object.freeze({
      executed: false,
      reason: "Backup bloqueado — política inválida.",
      ...SYNC_OWNERSHIP,
    });
  }

  const action = appendBackupAction(
    Object.freeze({
      groupId,
      tenantId,
      requestId: partial.requestId ?? null,
      label: partial.label ?? "Backup sincronizado",
      summary: partial.summary ?? "Backup acionado com trilha de auditoria.",
      backupSnapshot: partial.backupSnapshot ?? "tenant-backup",
      status: partial.status ?? "confirmed",
      providerState: partial.providerState ?? "available",
    })
  );

  return Object.freeze({ executed: true, action, explainable: true, ...SYNC_OWNERSHIP });
}

export default executeBackupSync;
