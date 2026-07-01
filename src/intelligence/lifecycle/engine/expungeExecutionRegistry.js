import { upsertExpungeExecution } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildExpungeExecutionRegistry(groupId, ctx, expungeApprovals) {
  if (!ctx.authorized) return Object.freeze({ executions: [], expungeAllowed: false });

  const executions = (expungeApprovals.approvals ?? []).map((a) =>
    upsertExpungeExecution(
      Object.freeze({
        executionId: `expexec-${a.approvalId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        approvalId: a.approvalId,
        label: a.label,
        summary: "Expurgo bloqueado até aprovação humana e trilha completa.",
        status: "blocked",
        expungeAllowed: false,
        expungeRequiresPolicyAndAudit: true,
        humanApprovalRequired: true,
        executed: false,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "expunge_execution_built", entityType: "expunge_execution" });
  return Object.freeze({
    executions: Object.freeze(executions),
    expungeAllowed: false,
    expungeRequiresPolicyAndAudit: true,
    explainable: true,
  });
}

export default buildExpungeExecutionRegistry;
