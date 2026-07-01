import { appendStorageAction } from "./durabilitySyncStore.js";
import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function executeStorageSync(groupId, tenantId, partial = {}) {
  if (!partial.policyValid && partial.policyValid !== undefined) {
    return Object.freeze({
      executed: false,
      reason: "Storage bloqueado — política inválida.",
      ...SYNC_OWNERSHIP,
    });
  }

  const action = appendStorageAction(
    Object.freeze({
      groupId,
      tenantId,
      requestId: partial.requestId ?? null,
      label: partial.label ?? "Integração storage sincronizada",
      summary: partial.summary ?? "Ação de storage registrada com trilha de auditoria.",
      actionType: partial.actionType ?? "archive",
      storageTarget: partial.storageTarget ?? "tenant-archive",
      status: partial.status ?? "confirmed",
      providerState: partial.providerState ?? "available",
    })
  );

  return Object.freeze({ executed: true, action, explainable: true, ...SYNC_OWNERSHIP });
}

export default executeStorageSync;
