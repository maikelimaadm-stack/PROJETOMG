import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export const NOTIFICATION_SEEDS = Object.freeze([
  Object.freeze({ id: "seed-approval-pending", triggerType: "approval_pending", label: "Aprovação pendente" }),
  Object.freeze({ id: "seed-divergence", triggerType: "divergence_detected", label: "Divergência detectada" }),
  Object.freeze({ id: "seed-storage", triggerType: "storage_confirmed", label: "Storage confirmado" }),
  Object.freeze({ id: "seed-backup", triggerType: "backup_confirmed", label: "Backup acionado" }),
  Object.freeze({ id: "seed-audit", triggerType: "audit_persisted", label: "Auditoria persistida" }),
]);

export function getNotificationSeedsRegistry() {
  return Object.freeze({ seeds: NOTIFICATION_SEEDS, ...SYNC_OWNERSHIP, explainable: true });
}

export default getNotificationSeedsRegistry;
