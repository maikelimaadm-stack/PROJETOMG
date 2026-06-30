const registry = new Map();

/** Observation registry — tracks what the platform observed per tenant */
export function registerObservation(envelope, memoryRecord) {
  const tenantId = envelope.tenantId ?? "default";
  const existing = registry.get(tenantId) ?? [];
  const observation = Object.freeze({
    observationId: `obs-${envelope.eventId}`,
    tenantId,
    observedAt: envelope.occurredAt,
    eventType: envelope.eventType,
    eventCategory: envelope.eventCategory,
    memoryId: memoryRecord?.memoryId ?? null,
    explainability: envelope.explainability,
    subject: envelope.subject,
    outcome: envelope.outcome,
  });
  existing.unshift(observation);
  registry.set(tenantId, existing.slice(0, 200));
  return observation;
}

export function listObservations(tenantId = "default", options = {}) {
  const limit = options.limit ?? 50;
  const fromRegistry = registry.get(tenantId) ?? [];
  if (fromRegistry.length >= limit) return fromRegistry.slice(0, limit);
  return fromRegistry.slice(0, limit);
}

export function getObservationRegistryInfo() {
  return Object.freeze({
    observationalOnly: true,
    invasiveActionsForbidden: true,
    autonomousExecutionForbidden: true,
  });
}

export default registerObservation;
