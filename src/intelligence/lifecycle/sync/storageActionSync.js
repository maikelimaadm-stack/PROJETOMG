import { appendStorageAction } from "./durabilitySyncStore.js";
import { recordStorageIntegration } from "../persistence/storageIntegrationAdapter.js";

export function syncStorageActions(groupId, tenantId, frontendEvents = [], backendActions = []) {
  const confirmed = [];
  let synced = 0;

  for (const fe of frontendEvents) {
    const match = backendActions.find(
      (be) => (be.requestId ?? be.entityId) === (fe.requestId ?? fe.eventId) || be.label === fe.label
    );
    const status = match?.status === "confirmed" ? "confirmed" : fe.status ?? "scheduled";

    const action = appendStorageAction(
      Object.freeze({
        groupId,
        tenantId,
        requestId: fe.requestId ?? null,
        label: fe.label ?? "Ação de storage",
        summary: match ? "Storage confirmado no backend." : "Storage aguardando confirmação.",
        actionType: fe.actionType ?? "archive",
        storageTarget: fe.storageTarget ?? "tenant-archive",
        status,
        backendConfirmed: Boolean(match),
      })
    );

    if (status === "confirmed") synced += 1;
    confirmed.push(action);

    if (!match && fe.status === "scheduled") {
      recordStorageIntegration(groupId, tenantId, {
        requestId: fe.requestId,
        actionType: fe.actionType,
        status: "sync_pending",
        summary: "Sincronização de storage em andamento.",
      });
    }
  }

  return Object.freeze({ synced, actions: confirmed, explainable: true });
}

export default syncStorageActions;
