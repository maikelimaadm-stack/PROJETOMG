import {
  BUSINESS_EVENT_ENVELOPE_VERSION,
  INTELLIGENCE_OWNERSHIP,
} from "../contracts/intelligenceContracts.js";
import { buildEventLineage } from "../memory/lineageStorage.js";

let eventSequence = 0;

function nextEventId(tenantId) {
  eventSequence += 1;
  return `evt-${tenantId}-${Date.now()}-${eventSequence}`;
}

/** Official domain event envelope — tenant-scoped, explainable, auditable */
export function createBusinessEventEnvelope(partial = {}) {
  const tenantId = partial.tenantId ?? "default";
  const occurredAt = partial.occurredAt ?? new Date().toISOString();

  return Object.freeze({
    schemaVersion: BUSINESS_EVENT_ENVELOPE_VERSION,
    eventId: partial.eventId ?? nextEventId(tenantId),
    tenantId,
    eventType: partial.eventType,
    eventCategory: partial.eventCategory,
    occurredAt,
    capturedAt: new Date().toISOString(),
    ownership: INTELLIGENCE_OWNERSHIP,
    provenance: Object.freeze({
      source: partial.source ?? "platform",
      surface: partial.surface ?? null,
      actorId: partial.actorId ?? null,
      actorRole: partial.actorRole ?? "business-user",
      sessionId: partial.sessionId ?? null,
    }),
    subject: Object.freeze({
      assetType: partial.assetType ?? null,
      assetId: partial.assetId ?? null,
      workflowId: partial.workflowId ?? null,
      intentId: partial.intentId ?? null,
      taskId: partial.taskId ?? null,
      capabilityId: partial.capabilityId ?? null,
    }),
    payload: Object.freeze(partial.payload ?? {}),
    outcome: Object.freeze(partial.outcome ?? null),
    explainability: Object.freeze({
      businessSummary: partial.businessSummary ?? "",
      whatHappened: partial.whatHappened ?? "",
      businessImpact: partial.businessImpact ?? null,
      evidenceRefs: Object.freeze(partial.evidenceRefs ?? []),
    }),
    lineage: buildEventLineage(partial.lineageInput ?? {}),
    metadata: Object.freeze(partial.metadata ?? {}),
  });
}

export default createBusinessEventEnvelope;
