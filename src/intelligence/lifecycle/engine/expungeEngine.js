import { upsertExpungeExecution } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";
import { resolveLifecycleStateTransition } from "./lifecycleLifecycle.js";
import { EXPUNGE_ENGINE_VERSION, LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";

export function requestExpungeExecution(groupId, ctx, partial = {}) {
  if (!ctx.authorized) {
    return Object.freeze({ allowed: false, reason: "Escopo não autorizado." });
  }

  const execution = upsertExpungeExecution(
    Object.freeze({
      executionId: partial.executionId ?? `expexec-req-${groupId}-${Date.now()}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: partial.label ?? "Solicitação de expurgo",
      summary: "Expurgo bloqueado. Decisão humana e trilha de auditoria obrigatórias.",
      status: "blocked",
      expungeAllowed: false,
      expungeRequiresPolicyAndAudit: true,
      humanApprovalRequired: true,
      executed: false,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendLifecycleAuditEntry({
    groupId,
    action: "expunge_requested",
    entityId: execution.executionId,
    entityType: "expunge_execution",
  });

  return Object.freeze({ allowed: false, execution, blocked: true, ...LIFECYCLE_OWNERSHIP, explainable: true });
}

export function executeExpungeWithApproval(groupId, ctx, executionId, approved = false) {
  if (!ctx.authorized || !approved) {
    appendLifecycleAuditEntry({
      groupId,
      action: "expunge_blocked",
      entityId: executionId,
      entityType: "expunge_execution",
      humanApproved: false,
    });
    return Object.freeze({
      executed: false,
      expungeAllowed: false,
      reason: "Expurgo exige política, aprovação humana e trilha de auditoria.",
      expungeRequiresPolicyAndAudit: true,
    });
  }

  const transition = resolveLifecycleStateTransition("expunge_pending_approval", "approve_expunge", true);

  appendLifecycleAuditEntry({
    groupId,
    action: "expunge_executed",
    entityId: executionId,
    entityType: "expunge_execution",
    humanApproved: true,
  });

  return Object.freeze({
    executed: true,
    engineVersion: EXPUNGE_ENGINE_VERSION,
    nextState: transition.nextState,
    explainable: true,
    expungeRequiresPolicyAndAudit: true,
  });
}

export default { requestExpungeExecution, executeExpungeWithApproval };
