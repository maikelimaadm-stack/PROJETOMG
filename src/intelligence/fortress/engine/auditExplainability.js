export function explainAuditEvent(event) {
  if (!event) return null;
  return Object.freeze({
    label: event.label,
    because: event.summary ?? "Evento auditado com trilha completa.",
    sensitive: event.sensitive ?? false,
    explainable: true,
  });
}

export default { explainAuditEvent };
