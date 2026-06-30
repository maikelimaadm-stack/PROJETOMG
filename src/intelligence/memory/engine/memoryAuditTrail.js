const auditLog = [];

export function appendMemoryAuditEntry(entry) {
  const record = Object.freeze({
    auditId: `maudit-${entry.tenantId}-${Date.now()}`,
    tenantId: entry.tenantId,
    memoryId: entry.memoryId,
    action: entry.action,
    eventType: entry.eventType ?? null,
    at: new Date().toISOString(),
  });
  auditLog.unshift(record);
  return record;
}

export function listMemoryEngineAudit(tenantId = "default", limit = 50) {
  return auditLog.filter((a) => a.tenantId === tenantId).slice(0, limit);
}

export default appendMemoryAuditEntry;
