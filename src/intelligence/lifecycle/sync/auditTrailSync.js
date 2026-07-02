import { upsertSyncRecord } from "./durabilitySyncStore.js";
import { appendDurableAuditEntry } from "../persistence/durableAuditTrailStore.js";

export function syncAuditTrail(groupId, tenantId, frontendAudits = [], backendAudits = []) {
  let persisted = 0;
  const records = [];

  const backendKeys = new Set(
    backendAudits.map((a) => a.auditId ?? a.id ?? `${a.action}-${a.recorded_at ?? a.recordedAt}`)
  );

  for (const fe of frontendAudits) {
    const key = fe.auditId ?? fe.id ?? `${fe.action}-${fe.recordedAt}`;
    const synced = backendKeys.has(key);

    upsertSyncRecord(
      Object.freeze({
        syncId: `lsync-audit-${key}`,
        groupId,
        entityType: "audit",
        entityId: key,
        label: fe.action,
        status: synced ? "synced" : "pending",
        summary: synced ? "Auditoria persistida no backend." : "Auditoria aguardando persistência.",
        frontendState: fe.action,
        backendState: synced ? fe.action : null,
      })
    );

    if (!synced) {
      appendDurableAuditEntry({
        groupId,
        tenantId,
        action: "audit_sync_pending",
        entityId: key,
        entityType: "lifecycle_audit_sync",
        summary: `Sincronização de auditoria pendente: ${fe.action}.`,
      });
    } else {
      persisted += 1;
    }

    records.push(Object.freeze({ id: key, label: fe.action, synced }));
  }

  return Object.freeze({ persisted, pending: frontendAudits.length - persisted, records, explainable: true });
}

export default syncAuditTrail;
