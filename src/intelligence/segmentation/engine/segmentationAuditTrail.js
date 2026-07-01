const auditLog = [];

export function appendSegmentationAuditEntry(entry) {
  const record = Object.freeze({
    auditId: `saudit-${entry.tenantId}-${Date.now()}`,
    tenantId: entry.tenantId ?? "default",
    action: entry.action,
    entityId: entry.entityId ?? null,
    entityType: entry.entityType ?? "segmentation",
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  auditLog.unshift(record);
  return record;
}

export function listSegmentationAuditEntries(tenantId = "default", limit = 50) {
  return auditLog.filter((a) => a.tenantId === tenantId).slice(0, limit);
}

export default { appendSegmentationAuditEntry, listSegmentationAuditEntries };
