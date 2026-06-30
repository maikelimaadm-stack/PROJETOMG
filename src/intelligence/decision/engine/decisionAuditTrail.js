const auditLog = [];

export function appendDecisionAuditEntry(entry) {
  const record = Object.freeze({
    auditId: `daudit-${entry.tenantId}-${Date.now()}`,
    tenantId: entry.tenantId ?? "default",
    action: entry.action,
    entityId: entry.entityId ?? null,
    entityType: entry.entityType ?? "decision",
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  auditLog.unshift(record);
  return record;
}

export function listDecisionAuditEntries(tenantId = "default", limit = 50) {
  return auditLog.filter((a) => a.tenantId === tenantId).slice(0, limit);
}

export default { appendDecisionAuditEntry, listDecisionAuditEntries };
