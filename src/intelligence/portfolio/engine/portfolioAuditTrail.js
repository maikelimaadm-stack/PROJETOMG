const auditLog = [];

export function appendPortfolioAuditEntry(partial) {
  const entry = Object.freeze({
    auditId: `paudit-${partial.groupId}-${Date.now()}`,
    groupId: partial.groupId ?? "unknown",
    action: partial.action ?? "audit",
    entityId: partial.entityId ?? null,
    entityType: partial.entityType ?? "unknown",
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  auditLog.push(entry);
  return entry;
}

export default appendPortfolioAuditEntry;
