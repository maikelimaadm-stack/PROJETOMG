const auditLog = [];

export function appendEvolutionAuditEntry(entry) {
  const record = Object.freeze({
    auditId: `evaudit-${entry.tenantId}-${Date.now()}`,
    tenantId: entry.tenantId ?? "default",
    action: entry.action,
    entityId: entry.entityId ?? null,
    entityType: entry.entityType ?? "evolution",
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  auditLog.unshift(record);
  return record;
}

export function listEvolutionAuditEntries(tenantId = "default", limit = 50) {
  return auditLog.filter((a) => a.tenantId === tenantId).slice(0, limit);
}

export default { appendEvolutionAuditEntry, listEvolutionAuditEntries };
