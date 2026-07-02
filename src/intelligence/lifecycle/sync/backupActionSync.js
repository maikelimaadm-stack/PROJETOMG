import { appendBackupAction } from "./durabilitySyncStore.js";
import { recordBackupIntegration } from "../persistence/backupIntegrationAdapter.js";

export function syncBackupActions(groupId, tenantId, frontendEvents = [], backendActions = []) {
  const confirmed = [];
  let synced = 0;

  for (const fe of frontendEvents) {
    const match = backendActions.find(
      (be) => (be.requestId ?? be.entityId) === (fe.requestId ?? fe.eventId) || be.label === fe.label
    );
    const status = match?.status === "confirmed" ? "confirmed" : fe.status ?? "scheduled";

    const action = appendBackupAction(
      Object.freeze({
        groupId,
        tenantId,
        requestId: fe.requestId ?? null,
        label: fe.label ?? "Backup de ciclo de vida",
        summary: match ? "Backup confirmado no backend." : "Backup aguardando confirmação.",
        backupSnapshot: fe.backupSnapshot ?? fe.snapshot ?? "tenant-backup",
        status,
        backendConfirmed: Boolean(match),
      })
    );

    if (status === "confirmed") synced += 1;
    confirmed.push(action);

    if (!match) {
      recordBackupIntegration(groupId, tenantId, {
        requestId: fe.requestId,
        status: "sync_pending",
        summary: "Sincronização de backup em andamento.",
      });
    }
  }

  return Object.freeze({ synced, actions: confirmed, explainable: true });
}

export default syncBackupActions;
