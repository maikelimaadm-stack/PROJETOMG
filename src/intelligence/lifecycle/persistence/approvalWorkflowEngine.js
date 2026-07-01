/**
 * Approval Workflow Engine — human approve/reject with durable persistence.
 * @see Program 3.26
 */
import { APPROVAL_WORKFLOW_VERSION, PERSISTENCE_OWNERSHIP, APPROVAL_STATUSES } from "./lifecyclePersistenceContracts.js";
import {
  upsertApprovalRequest,
  upsertExecutionJob,
  appendDurableAuditEntry,
  upsertTransition,
  upsertStateRecord,
  getApprovalRequest,
} from "./durableLifecycleStore.js";
import { enqueueLifecycleExecution } from "./lifecycleExecutionQueue.js";
import { recordStorageIntegration } from "./storageIntegrationAdapter.js";
import { recordBackupIntegration } from "./backupIntegrationAdapter.js";

export function createApprovalRequest(groupId, tenantId, ctx, partial = {}) {
  if (!ctx?.authorized) {
    return Object.freeze({ created: false, reason: "Escopo não autorizado." });
  }

  const request = upsertApprovalRequest(
    Object.freeze({
      requestId: partial.requestId ?? `lreq-${groupId}-${partial.actionType ?? "archive"}-${Date.now()}`,
      groupId,
      tenantId,
      clienteId: ctx.ownerClientId ?? null,
      authorizedTenantIds: ctx.authorizedTenantIds ?? [],
      actionType: partial.actionType ?? "archive",
      label: partial.label ?? "Solicitação de ciclo de vida",
      summary: partial.summary ?? "Aguardando aprovação humana e trilha de auditoria.",
      dataCategory: partial.dataCategory ?? "operacional",
      status: "pending",
      humanApprovalRequired: true,
      policyValid: partial.policyValid ?? true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendDurableAuditEntry({
    groupId,
    tenantId,
    action: "approval_requested",
    entityId: request.requestId,
    entityType: "approval_request",
    summary: request.summary,
  });

  return Object.freeze({ created: true, request, ...PERSISTENCE_OWNERSHIP, explainable: true });
}

export function approveLifecycleRequest(requestId, actorId = "administrador", options = {}) {
  const request = getApprovalRequest(requestId);
  if (!request) {
    return Object.freeze({ approved: false, reason: "Solicitação não encontrada." });
  }
  if (request.status !== "pending") {
    return Object.freeze({ approved: false, reason: "Solicitação já decidida." });
  }
  if (!request.policyValid) {
    appendDurableAuditEntry({
      groupId: request.groupId,
      tenantId: request.tenantId,
      action: "approval_blocked_policy",
      entityId: requestId,
      humanApproved: false,
    });
    return Object.freeze({ approved: false, reason: "Política inválida — aprovação bloqueada." });
  }

  const approved = upsertApprovalRequest(
    Object.freeze({
      ...request,
      status: "approved",
      approvedBy: actorId,
      decidedAt: new Date().toISOString(),
    })
  );

  appendDurableAuditEntry({
    groupId: request.groupId,
    tenantId: request.tenantId,
    action: "approval_granted",
    entityId: requestId,
    entityType: "approval_request",
    actorId,
    humanApproved: true,
    summary: options.reason ?? "Aprovado por administrador autorizado.",
  });

  upsertTransition(
    Object.freeze({
      transitionId: `ltr-${requestId}-approved`,
      groupId: request.groupId,
      tenantId: request.tenantId,
      requestId,
      fromStatus: "pending",
      toStatus: "approved",
      because: "Aprovação humana registrada com trilha durável.",
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  const job = enqueueLifecycleExecution(request.groupId, request.tenantId, approved, { actorId });

  recordStorageIntegration(request.groupId, request.tenantId, {
    actionType: request.actionType,
    requestId,
    status: "scheduled",
  });
  recordBackupIntegration(request.groupId, request.tenantId, {
    actionType: request.actionType,
    requestId,
    status: "snapshot_scheduled",
  });

  return Object.freeze({
    approved: true,
    engineVersion: APPROVAL_WORKFLOW_VERSION,
    request: approved,
    job,
    explainable: true,
  });
}

export function rejectLifecycleRequest(requestId, actorId = "administrador", reason = "") {
  const request = getApprovalRequest(requestId);
  if (!request) {
    return Object.freeze({ rejected: false, reason: "Solicitação não encontrada." });
  }
  if (request.status !== "pending") {
    return Object.freeze({ rejected: false, reason: "Solicitação já decidida." });
  }

  const rejected = upsertApprovalRequest(
    Object.freeze({
      ...request,
      status: "rejected",
      rejectedBy: actorId,
      rejectionReason: reason || "Rejeitado por administrador autorizado.",
      decidedAt: new Date().toISOString(),
    })
  );

  appendDurableAuditEntry({
    groupId: request.groupId,
    tenantId: request.tenantId,
    action: "approval_rejected",
    entityId: requestId,
    actorId,
    humanApproved: false,
    summary: rejected.rejectionReason,
  });

  upsertTransition(
    Object.freeze({
      transitionId: `ltr-${requestId}-rejected`,
      groupId: request.groupId,
      tenantId: request.tenantId,
      requestId,
      fromStatus: "pending",
      toStatus: "rejected",
      because: rejected.rejectionReason,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  return Object.freeze({ rejected: true, request: rejected, explainable: true });
}

export function finalizeExecutedRequest(requestId, executionResult = {}) {
  const request = getApprovalRequest(requestId);
  if (!request || request.status !== "approved") {
    return Object.freeze({ finalized: false, reason: "Execução exige aprovação prévia." });
  }

  const executed = upsertApprovalRequest(
    Object.freeze({
      ...request,
      status: "executed",
      executedAt: new Date().toISOString(),
    })
  );

  upsertStateRecord(
    Object.freeze({
      stateId: `lstate-${requestId}`,
      groupId: request.groupId,
      tenantId: request.tenantId,
      requestId,
      label: `Estado: ${request.actionType}`,
      currentState: executionResult.nextState ?? "executed",
      summary: executionResult.summary ?? "Ação persistida com trilha completa.",
      stateChangeRequiresAuditTrail: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendDurableAuditEntry({
    groupId: request.groupId,
    tenantId: request.tenantId,
    action: "lifecycle_executed",
    entityId: requestId,
    humanApproved: true,
    summary: executed.summary,
  });

  return Object.freeze({ finalized: true, request: executed, explainable: true });
}

export default {
  createApprovalRequest,
  approveLifecycleRequest,
  rejectLifecycleRequest,
  finalizeExecutedRequest,
  APPROVAL_STATUSES,
};
