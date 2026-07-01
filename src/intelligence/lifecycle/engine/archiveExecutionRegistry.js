import { upsertArchiveExecution } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildArchiveExecutionRegistry(groupId, ctx, archiveLifecycles) {
  if (!ctx.authorized) return Object.freeze({ executions: [] });

  const executions = (archiveLifecycles.archives ?? []).map((a) =>
    upsertArchiveExecution(
      Object.freeze({
        executionId: `archexec-${a.archiveLifecycleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        archiveLifecycleId: a.archiveLifecycleId,
        label: `Arquivamento: ${a.dataCategory}`,
        summary: "Arquivamento controlado — aguardando aprovação humana.",
        dataCategory: a.dataCategory,
        status: "pending_approval",
        archiveRequiresPolicyAndAudit: true,
        humanApprovalRequired: true,
        executed: false,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "archive_execution_built", entityType: "archive_execution" });
  return Object.freeze({ executions: Object.freeze(executions), explainable: true });
}

export default buildArchiveExecutionRegistry;
