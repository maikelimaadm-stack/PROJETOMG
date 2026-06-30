const auditLog = [];

export function appendConsultingAuditEntry(entry) {
  const record = Object.freeze({
    auditId: `caudit-${entry.tenantId}-${Date.now()}`,
    tenantId: entry.tenantId ?? "default",
    action: entry.action,
    entityId: entry.entityId ?? null,
    entityType: entry.entityType ?? "consulting",
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  auditLog.unshift(record);
  return record;
}

export function listConsultingAuditEntries(tenantId = "default", limit = 50) {
  return auditLog.filter((a) => a.tenantId === tenantId).slice(0, limit);
}

export default { appendConsultingAuditEntry, listConsultingAuditEntries };
