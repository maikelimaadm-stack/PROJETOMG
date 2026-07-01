const templateAuditLog = [];

export function appendTemplateAuditEntry(entry) {
  const record = Object.freeze({
    auditId: `taudit-${entry.tenantId ?? "catalog"}-${Date.now()}`,
    tenantId: entry.tenantId ?? null,
    templateId: entry.templateId ?? null,
    action: entry.action,
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  templateAuditLog.unshift(record);
  return record;
}

export default { appendTemplateAuditEntry };
