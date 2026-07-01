const auditLog = [];

export function appendGovernanceAuditEntry(partial) {
  const entry = Object.freeze({
    auditId: `gaudit-${partial.groupId ?? "unknown"}-${Date.now()}`,
    groupId: partial.groupId ?? "unknown",
    action: partial.action ?? "audit",
    entityId: partial.entityId ?? null,
    entityType: partial.entityType ?? "unknown",
    recordedAt: new Date().toISOString(),
    explainable: true,
    policyChangeRequiresAudit: true,
  });
  auditLog.push(entry);
  return entry;
}

export function listGovernanceAuditTrail(groupId, options = {}) {
  return auditLog.filter((e) => e.groupId === groupId).slice(0, options.limit ?? 50);
}

export default appendGovernanceAuditEntry;
