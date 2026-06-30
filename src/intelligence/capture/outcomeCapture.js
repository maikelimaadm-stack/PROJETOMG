import {
  BUSINESS_EVENT_CATEGORIES,
  BUSINESS_EVENT_TYPES,
} from "../contracts/intelligenceContracts.js";
import { publishDomainEvent } from "../bus/domainEventBus.js";

export function captureBusinessOutcome(input) {
  return publishDomainEvent({
    tenantId: input.tenantId ?? "default",
    eventType: BUSINESS_EVENT_TYPES.WORKFLOW_OUTCOME_COMPLETED,
    eventCategory: BUSINESS_EVENT_CATEGORIES.OUTCOME,
    source: input.source ?? "platform",
    surface: input.surface ?? null,
    actorId: input.actorId ?? "business-user",
    assetType: input.assetType ?? null,
    assetId: input.assetId ?? null,
    workflowId: input.workflowId ?? null,
    intentId: input.intentId ?? null,
    payload: Object.freeze(input.payload ?? {}),
    outcome: Object.freeze({
      status: input.status,
      success: input.success ?? true,
      terminal: input.terminal ?? true,
    }),
    businessSummary: input.businessSummary ?? "Resultado de negócio registrado.",
    whatHappened: input.whatHappened ?? "Operação concluída com resultado mensurável.",
    businessImpact: input.businessImpact ?? null,
    lineageInput: input.lineageInput ?? {},
  });
}

export function captureUserConfirmation(input) {
  return publishDomainEvent({
    tenantId: input.tenantId ?? "default",
    eventType: BUSINESS_EVENT_TYPES.BOS_USER_CONFIRMATION,
    eventCategory: BUSINESS_EVENT_CATEGORIES.BOS,
    source: "bos",
    surface: input.surface ?? "bos.business-first",
    actorId: input.actorId ?? "business-user",
    assetType: input.assetType,
    assetId: input.assetId,
    payload: Object.freeze({
      confirmed: true,
      assetKind: input.assetKind,
    }),
    businessSummary: input.businessSummary ?? "Usuário confirmou criação de ativo de negócio.",
    whatHappened: "Confirmação humana registrada antes de materializar operação.",
    lineageInput: {
      intentId: input.intentId,
      assetId: input.assetId,
      assetType: input.assetType,
    },
  });
}

export default captureBusinessOutcome;
