const auditLog = [];

export function appendRecommendationAuditEntry(entry) {
  const record = Object.freeze({
    auditId: `raudit-${entry.tenantId}-${Date.now()}`,
    tenantId: entry.tenantId ?? "default",
    action: entry.action,
    entityId: entry.entityId ?? null,
    entityType: entry.entityType ?? "recommendation",
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  auditLog.unshift(record);
  return record;
}

export function appendReplicationAuditEntry(entry) {
  return appendRecommendationAuditEntry({ ...entry, entityType: entry.entityType ?? "replication" });
}

export function listRecommendationAuditEntries(tenantId = "default", limit = 50) {
  return auditLog.filter((a) => a.tenantId === tenantId).slice(0, limit);
}

export default { appendRecommendationAuditEntry, appendReplicationAuditEntry };
