import {
  BUSINESS_EVENT_CATEGORIES,
  BUSINESS_EVENT_TYPES,
} from "../contracts/intelligenceContracts.js";
import { publishDomainEvent } from "../bus/domainEventBus.js";
import { captureWorkflowOutcome, captureWorkflowTaskCreated } from "../capture/workflowOutcomeCapture.js";
import { captureIntentOutcome, captureIntentResolved } from "../capture/intentOutcomeCapture.js";
import { captureHumanDecision } from "../capture/decisionCapture.js";
import { captureUserConfirmation } from "../capture/outcomeCapture.js";
import { processObservationLayer } from "../observation/observationLayer.js";

/** Non-invasive bridge — captures business operations without blocking UX */
export function captureBosHomeViewed(tenantId, actorId) {
  return publishDomainEvent({
    tenantId: tenantId ?? "default",
    eventType: BUSINESS_EVENT_TYPES.BOS_HOME_VIEWED,
    eventCategory: BUSINESS_EVENT_CATEGORIES.BOS,
    source: "bos",
    surface: "bos.home",
    actorId,
    businessSummary: "Operador acessou a superfície principal de operação de negócio.",
    whatHappened: "Visita ao Business Operating Shell registrada.",
  });
}

export function bridgeWorkflowTaskAction(input) {
  const envelope = captureWorkflowOutcome(input);
  captureHumanDecision({
    tenantId: input.tenantId,
    decision: input.action,
    workflowId: input.workflowId,
    taskId: input.taskId,
    actorId: input.actorId,
    surface: "bos.workflow.inbox",
    businessSummary: input.explainability,
    parentEventId: envelope.eventId,
  });
  processObservationLayer(input.tenantId ?? "default");
  return envelope;
}

export function bridgeWorkflowTaskCreated(input) {
  const envelope = captureWorkflowTaskCreated(input);
  processObservationLayer(input.tenantId ?? "default");
  return envelope;
}

export function bridgeIntentResolverResult(result, options = {}) {
  const tenantId = options.tenantId ?? result.context?.tenantId ?? "default";
  const actorId = options.actorId ?? "business-user";
  const preview = options.preview ?? false;

  if (result.intentDocument?.id) {
    captureIntentResolved({
      tenantId,
      intentId: result.intentDocument.id,
      intentRevision: result.intentDocument.revision,
      status: result.status,
      derivationCount: result.derivations?.length ?? 0,
      assetType: result.businessWorkflow?.assetType ?? result.businessComputedField?.assetType,
      assetId: result.businessWorkflow?.id ?? result.businessComputedField?.id,
      explainability: result.explainability?.businessSummary,
      actorId,
    });
  }

  captureIntentOutcome({
    tenantId,
    intentId: result.intentDocument?.id,
    intentRevision: result.intentDocument?.revision,
    ok: result.ok,
    preview,
    assetType: result.businessWorkflow?.assetType ?? result.businessComputedField?.assetType,
    assetId: result.businessWorkflow?.id ?? result.businessComputedField?.id,
    derivationKind: result.derivations?.[0]?.derivationKind,
    capabilityId: result.capabilityResolution?.capabilities?.[0]?.capabilityId,
    intentPhrase: result.intentDocument?.intentPhrase,
    explainability:
      result.businessExplainability?.businessSummary ??
      result.explainability?.businessSummary,
    actorId,
  });

  if (!preview && result.ok) {
    processObservationLayer(tenantId);
  }

  return result;
}

export function bridgeUserConfirmation(input) {
  const envelope = captureUserConfirmation(input);
  processObservationLayer(input.tenantId ?? "default");
  return envelope;
}

export default {
  captureBosHomeViewed,
  bridgeWorkflowTaskAction,
  bridgeWorkflowTaskCreated,
  bridgeIntentResolverResult,
  bridgeUserConfirmation,
};
