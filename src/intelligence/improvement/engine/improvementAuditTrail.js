import { upsertImprovementEvent } from "./improvementEngineStore.js";

export function appendImprovementAuditEntry(partial) {
  const entry = Object.freeze({
    eventId: `iaudit-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    action: partial.action ?? "audit",
    entityId: partial.entityId ?? null,
    entityType: partial.entityType ?? "unknown",
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  upsertImprovementEvent(entry);
  return entry;
}

export default appendImprovementAuditEntry;
