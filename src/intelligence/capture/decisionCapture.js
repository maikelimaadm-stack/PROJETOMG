import {
  BUSINESS_EVENT_CATEGORIES,
  BUSINESS_EVENT_TYPES,
} from "../contracts/intelligenceContracts.js";
import { publishDomainEvent } from "../bus/domainEventBus.js";

export function captureHumanDecision(input) {
  return publishDomainEvent({
    tenantId: input.tenantId ?? "default",
    eventType: BUSINESS_EVENT_TYPES.DECISION_HUMAN,
    eventCategory: BUSINESS_EVENT_CATEGORIES.DECISION,
    source: input.source ?? "platform",
    surface: input.surface ?? null,
    actorId: input.actorId ?? "business-user",
    workflowId: input.workflowId ?? null,
    taskId: input.taskId ?? null,
    intentId: input.intentId ?? null,
    payload: Object.freeze({
      decision: input.decision,
      rationale: input.rationale ?? null,
      alternatives: Object.freeze(input.alternatives ?? []),
    }),
    outcome: Object.freeze({
      decision: input.decision,
      automated: false,
    }),
    businessSummary: input.businessSummary ?? `Decisão humana registrada: ${input.decision}.`,
    whatHappened: "Operador tomou decisão com aprovação explícita.",
    businessImpact: input.businessImpact ?? null,
    lineageInput: {
      workflowId: input.workflowId,
      intentId: input.intentId,
      parentEventId: input.parentEventId,
    },
  });
}

export default captureHumanDecision;
