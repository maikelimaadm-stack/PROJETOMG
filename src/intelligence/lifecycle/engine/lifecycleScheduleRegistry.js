import { upsertLifecycleSchedule } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildLifecycleScheduleRegistry(groupId, ctx, lifecycleRules) {
  if (!ctx.authorized) return Object.freeze({ schedules: [] });

  const schedules = (lifecycleRules.rules ?? []).map((lr) =>
    upsertLifecycleSchedule(
      Object.freeze({
        scheduleId: `lsched-${lr.ruleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        ruleId: lr.ruleId,
        label: `Agenda: ${lr.dataCategory}`,
        summary: `Ciclo de retenção e arquivamento para ${lr.dataCategory}.`,
        dataCategory: lr.dataCategory,
        retentionDays: 365,
        status: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "lifecycle_schedules_built", entityType: "schedule" });
  return Object.freeze({ schedules: Object.freeze(schedules), explainable: true });
}

export default buildLifecycleScheduleRegistry;
