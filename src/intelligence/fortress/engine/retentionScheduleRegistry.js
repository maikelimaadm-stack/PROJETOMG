import { upsertRetentionSchedule } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildRetentionScheduleRegistry(groupId, ctx, retentionRules) {
  if (!ctx.authorized) return Object.freeze({ schedules: [] });

  const schedules = (retentionRules.rules ?? []).map((r) =>
    upsertRetentionSchedule(
      Object.freeze({
        scheduleId: `fsched-${r.ruleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        ruleId: r.ruleId,
        label: `Agenda: ${r.label}`,
        dataCategory: r.dataCategory,
        retentionDays: r.retentionDays,
        nextReviewAt: new Date(Date.now() + r.retentionDays * 86400000).toISOString(),
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendFortressAuditEntry({ groupId, action: "retention_schedules_built", entityType: "schedule" });
  return Object.freeze({ schedules: Object.freeze(schedules), explainable: true });
}

export default buildRetentionScheduleRegistry;
