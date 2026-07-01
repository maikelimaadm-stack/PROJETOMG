import { upsertArchiveExecution, upsertDataState } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";
import { resolveLifecycleStateTransition } from "./lifecycleLifecycle.js";
import { ARCHIVE_ENGINE_VERSION, LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";

export function requestArchiveExecution(groupId, ctx, partial = {}) {
  if (!ctx.authorized) {
    return Object.freeze({ allowed: false, reason: "Escopo não autorizado." });
  }

  const execution = upsertArchiveExecution(
    Object.freeze({
      executionId: partial.executionId ?? `archexec-req-${groupId}-${Date.now()}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: partial.label ?? "Solicitação de arquivamento",
      summary: "Arquivamento registrado. Execução exige aprovação humana e trilha.",
      dataCategory: partial.dataCategory ?? "operacional",
      status: "pending_approval",
      archiveRequiresPolicyAndAudit: true,
      humanApprovalRequired: true,
      executed: false,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendLifecycleAuditEntry({
    groupId,
    action: "archive_requested",
    entityId: execution.executionId,
    entityType: "archive_execution",
  });

  return Object.freeze({ allowed: true, execution, ...LIFECYCLE_OWNERSHIP, explainable: true });
}

export function executeArchiveWithApproval(groupId, ctx, executionId, approved = false) {
  if (!ctx.authorized || !approved) {
    appendLifecycleAuditEntry({
      groupId,
      action: "archive_blocked",
      entityId: executionId,
      entityType: "archive_execution",
      humanApproved: false,
    });
    return Object.freeze({
      executed: false,
      reason: "Aprovação humana e política válida necessárias.",
      archiveRequiresPolicyAndAudit: true,
    });
  }

  const transition = resolveLifecycleStateTransition("active", "archive", true);
  const state = upsertDataState(
    Object.freeze({
      stateId: `dstate-exec-${executionId}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Arquivado",
      summary: "Registro arquivado com origem rastreável e trilha completa.",
      currentState: transition.nextState,
      stateChangeRequiresAuditTrail: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendLifecycleAuditEntry({
    groupId,
    action: "archive_executed",
    entityId: executionId,
    entityType: "archive_execution",
    humanApproved: true,
  });

  return Object.freeze({
    executed: true,
    engineVersion: ARCHIVE_ENGINE_VERSION,
    state,
    explainable: true,
    archiveRequiresPolicyAndAudit: true,
  });
}

export default { requestArchiveExecution, executeArchiveWithApproval };
