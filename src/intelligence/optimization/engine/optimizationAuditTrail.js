import { upsertOptimizationEvent } from "./optimizationEngineStore.js";

export function appendOptimizationAuditEntry(partial) {
  const entry = Object.freeze({
    eventId: `oaudit-${partial.tenantId}-${Date.now()}`,
    tenantId: partial.tenantId ?? "default",
    action: partial.action ?? "audit",
    entityId: partial.entityId ?? null,
    entityType: partial.entityType ?? "unknown",
    recordedAt: new Date().toISOString(),
    explainable: true,
  });
  upsertOptimizationEvent(entry);
  return entry;
}

export default appendOptimizationAuditEntry;
