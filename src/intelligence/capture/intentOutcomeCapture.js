import {
  BUSINESS_EVENT_CATEGORIES,
  BUSINESS_EVENT_TYPES,
} from "../contracts/intelligenceContracts.js";
import { publishDomainEvent } from "../bus/domainEventBus.js";

export function captureIntentOutcome(input) {
  const {
    tenantId = "default",
    intentId,
    intentRevision,
    ok,
    assetType,
    assetId,
    derivationKind,
    actorId = "business-user",
    preview = false,
    intentPhrase,
    explainability,
  } = input;

  const eventType = preview
    ? BUSINESS_EVENT_TYPES.INTENT_PREVIEW
    : ok
      ? BUSINESS_EVENT_TYPES.INTENT_OUTCOME_SUCCESS
      : BUSINESS_EVENT_TYPES.INTENT_OUTCOME_FAILED;

  return publishDomainEvent({
    tenantId,
    eventType,
    eventCategory: preview ? BUSINESS_EVENT_CATEGORIES.INTENT : BUSINESS_EVENT_CATEGORIES.OUTCOME,
    source: "intent.resolver",
    surface: preview ? "bos.business-first.preview" : "intent.resolver",
    actorId,
    intentId,
    assetType,
    assetId,
    capabilityId: input.capabilityId ?? null,
    payload: Object.freeze({
      ok,
      preview,
      derivationKind,
      intentPhrase,
    }),
    outcome: Object.freeze({
      success: ok,
      preview,
      assetCreated: Boolean(assetId) && ok && !preview,
    }),
    businessSummary:
      explainability ??
      (ok
        ? `Intenção interpretada: ${intentPhrase ?? intentId}`
        : `Intenção não pôde ser interpretada: ${intentPhrase ?? intentId}`),
    whatHappened: preview
      ? "Usuário solicitou pré-visualização da intenção de negócio."
      : ok
        ? "Intenção de negócio resolvida com sucesso."
        : "Resolução de intenção falhou — diagnóstico disponível.",
    businessImpact: ok && !preview ? "Novo ativo ou projeção de negócio disponível." : null,
    lineageInput: {
      intentId,
      intentRevision,
      assetId,
      assetType,
      derivationKind,
    },
  });
}

export function captureIntentResolved(input) {
  return publishDomainEvent({
    tenantId: input.tenantId ?? "default",
    eventType: BUSINESS_EVENT_TYPES.INTENT_RESOLVED,
    eventCategory: BUSINESS_EVENT_CATEGORIES.INTENT,
    source: "intent.resolver",
    surface: "intent.resolver.pipeline",
    actorId: input.actorId ?? "system",
    intentId: input.intentId,
    assetType: input.assetType,
    assetId: input.assetId,
    payload: Object.freeze({
      status: input.status,
      derivationCount: input.derivationCount ?? 0,
    }),
    businessSummary: input.explainability ?? "Intent Resolver concluiu processamento.",
    whatHappened: "Pipeline oficial de resolução de intenção executado.",
    lineageInput: {
      intentId: input.intentId,
      intentRevision: input.intentRevision,
      assetId: input.assetId,
      assetType: input.assetType,
    },
  });
}

export default captureIntentOutcome;
