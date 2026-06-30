import {
  BUSINESS_EVENT_CATEGORIES,
  BUSINESS_EVENT_TYPES,
} from "../contracts/intelligenceContracts.js";
import { publishDomainEvent } from "../bus/domainEventBus.js";

export function captureWorkflowOutcome(input) {
  const {
    tenantId = "default",
    workflowId,
    taskId,
    action,
    fromState,
    toState,
    actorId = "business-user",
    workflowTitle,
    explainability,
  } = input;

  const actionTypeMap = {
    approve: BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_APPROVE,
    reject: BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_REJECT,
    return: BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_RETURN,
    escalate: BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_ESCALATE,
  };

  const eventType = actionTypeMap[action] ?? BUSINESS_EVENT_TYPES.WORKFLOW_OUTCOME_COMPLETED;
  const isTerminal = ["aprovado", "rejeitado", "concluido"].includes(toState);

  return publishDomainEvent({
    tenantId,
    eventType,
    eventCategory: isTerminal ? BUSINESS_EVENT_CATEGORIES.OUTCOME : BUSINESS_EVENT_CATEGORIES.WORKFLOW,
    source: "business.workflow",
    surface: "bos.workflow.inbox",
    actorId,
    workflowId,
    taskId,
    assetType: "business.asset.workflow",
    assetId: workflowId,
    payload: Object.freeze({ action, fromState, toState, workflowTitle }),
    outcome: Object.freeze({
      status: toState,
      terminal: isTerminal,
      humanDecision: true,
    }),
    businessSummary: explainability ?? `Processo "${workflowTitle ?? workflowId}" — ${action} registrado.`,
    whatHappened: `Responsável executou "${action}" no processo de aprovação.`,
    businessImpact: isTerminal ? "Processo encerrado com decisão humana." : "Processo avançou com intervenção humana.",
    lineageInput: { workflowId, assetId: workflowId, assetType: "business.asset.workflow" },
  });
}

export function captureWorkflowTaskCreated(input) {
  return publishDomainEvent({
    tenantId: input.tenantId ?? "default",
    eventType: BUSINESS_EVENT_TYPES.WORKFLOW_TASK_CREATED,
    eventCategory: BUSINESS_EVENT_CATEGORIES.WORKFLOW,
    source: "business.workflow",
    surface: "bos.business-first",
    actorId: input.actorId ?? "business-user",
    workflowId: input.workflowId,
    taskId: input.taskId,
    assetType: "business.asset.workflow",
    assetId: input.workflowId,
    payload: Object.freeze({
      workflowTitle: input.workflowTitle,
      stateId: input.stateId,
    }),
    businessSummary: input.explainability ?? "Nova pendência de aprovação registrada.",
    whatHappened: "Fluxo de aprovação derivado por intenção entrou na caixa de pendências.",
    lineageInput: {
      workflowId: input.workflowId,
      intentId: input.intentId,
      assetId: input.workflowId,
      assetType: "business.asset.workflow",
    },
  });
}

export default captureWorkflowOutcome;
