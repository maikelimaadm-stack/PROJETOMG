const auditLog = [];

export function appendCorporateAuditEntry(partial) {
  const entry = Object.freeze({
    auditId: `caudit-${partial.groupId}-${Date.now()}`,
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

export default appendCorporateAuditEntry;
