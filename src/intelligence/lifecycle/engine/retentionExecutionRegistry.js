import { upsertRetentionExecution } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildRetentionExecutionRegistry(groupId, ctx, schedules) {
  if (!ctx.authorized) return Object.freeze({ executions: [] });

  const executions = (schedules.schedules ?? []).map((s) =>
    upsertRetentionExecution(
      Object.freeze({
        executionId: `retexec-${s.scheduleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        scheduleId: s.scheduleId,
        label: `Retenção: ${s.dataCategory}`,
        summary: `Retenção de ${s.retentionDays} dias para ${s.dataCategory}.`,
        dataCategory: s.dataCategory,
        retentionDays: s.retentionDays,
        status: "active",
        retentionRequiresExplicitRule: true,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "retention_execution_built", entityType: "retention_execution" });
  return Object.freeze({ executions: Object.freeze(executions), explainable: true });
}

export default buildRetentionExecutionRegistry;
