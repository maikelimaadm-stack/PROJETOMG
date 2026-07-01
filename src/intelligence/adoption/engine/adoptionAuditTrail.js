import { upsertAdoptionEvent } from "./adoptionEngineStore.js";

export function appendAdoptionAuditEntry(partial) {
  const entry = Object.freeze({
    eventId: `audit-${partial.tenantId}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    tenantId: partial.tenantId ?? "default",
    action: partial.action ?? "audit",
    entityId: partial.entityId ?? null,
    entityType: partial.entityType ?? "unknown",
    recordedAt: new Date().toISOString(),
    explainable: true,
    individualProfilingForbidden: true,
  });
  upsertAdoptionEvent(entry);
  return entry;
}

export default appendAdoptionAuditEntry;
