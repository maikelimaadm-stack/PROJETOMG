import { listNotifications } from "./durabilitySyncStore.js";
import { appendNotification } from "./durabilitySyncStore.js";
import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

const TRIGGER_TYPES = Object.freeze([
  "approval_pending",
  "approval_synced",
  "execution_pending",
  "divergence_detected",
  "storage_confirmed",
  "backup_confirmed",
  "audit_persisted",
  "retry_scheduled",
]);

export function registerNotificationTrigger(groupId, tenantId, trigger) {
  if (!trigger.scopeAuthorized) {
    return Object.freeze({ registered: false, reason: "Notificação fora do escopo autorizado." });
  }

  const notification = appendNotification(
    Object.freeze({
      groupId,
      tenantId,
      triggerType: trigger.triggerType,
      label: trigger.label ?? "Alerta de ciclo de vida",
      summary: trigger.summary ?? "",
      scopeAuthorized: true,
      delivered: false,
    })
  );

  return Object.freeze({ registered: true, notification, ...SYNC_OWNERSHIP });
}

export function buildNotificationRegistry(groupId) {
  const items = listNotifications(groupId, { limit: 30 });
  return Object.freeze({
    groupId,
    triggerTypes: TRIGGER_TYPES,
    notifications: items.map((n) =>
      Object.freeze({
        id: n.notificationId,
        label: n.label,
        context: n.summary,
        triggerType: n.triggerType,
        delivered: n.delivered,
      })
    ),
    pendingCount: items.filter((n) => !n.delivered).length,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default { registerNotificationTrigger, buildNotificationRegistry };
