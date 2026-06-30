import { listDomainEvents } from "../bus/domainEventBus.js";
import { BUSINESS_EVENT_TYPES } from "../contracts/intelligenceContracts.js";
import { createExplainableIntelligenceRecord } from "../signals/explainableIntelligenceRecord.js";

/** Business Event Timeline — ordered history per tenant */
export function buildBusinessEventTimeline(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  const events = listDomainEvents(tenantId, { limit });

  return Object.freeze(
    events.map((event) =>
      Object.freeze({
        id: event.eventId,
        when: event.occurredAt,
        label: event.explainability?.whatHappened ?? event.eventType,
        context: event.explainability?.businessSummary ?? "",
        eventType: event.eventType,
        assetId: event.subject?.assetId,
        workflowId: event.subject?.workflowId,
        intentId: event.subject?.intentId,
        outcome: event.outcome,
        explainableRecord: createExplainableIntelligenceRecord(event),
      })
    )
  );
}

export function formatTimelineForBos(timeline = []) {
  return timeline.slice(0, 10).map((item) =>
    Object.freeze({
      id: item.id,
      label: item.label,
      context: item.context,
      when: formatRelativeWhen(item.when),
    })
  );
}

function formatRelativeWhen(isoDate) {
  if (!isoDate) return "Recente";
  const diff = Date.now() - new Date(isoDate).getTime();
  if (diff < 60_000) return "Agora";
  if (diff < 3_600_000) return "Hoje";
  if (diff < 86_400_000) return "Recente";
  return new Date(isoDate).toLocaleDateString("pt-BR");
}

export default buildBusinessEventTimeline;
