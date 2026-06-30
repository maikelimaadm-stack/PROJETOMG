const auditLog = [];

export function appendKnowledgeAuditEntry(entry) {
  const record = Object.freeze({
    auditId: `kgaudit-${entry.tenantId}-${Date.now()}`,
    tenantId: entry.tenantId,
    action: entry.action,
    nodeId: entry.nodeId ?? null,
    edgeId: entry.edgeId ?? null,
    at: new Date().toISOString(),
  });
  auditLog.unshift(record);
  return record;
}

export function listKnowledgeAuditTrail(tenantId = "default", limit = 50) {
  return auditLog.filter((a) => a.tenantId === tenantId).slice(0, limit);
}

export default appendKnowledgeAuditEntry;
