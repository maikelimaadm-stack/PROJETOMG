import { upsertDnaMilestone } from "./businessDnaStore.js";
import { appendDnaAuditEntry } from "./businessDnaAuditTrail.js";

export function registerDnaMilestones(tenantId, maturity, timeline) {
  const milestones = [];
  milestones.push(
    upsertDnaMilestone(
      Object.freeze({
        milestoneId: `bmil-${tenantId}-maturity`,
        tenantId,
        label: `Maturidade ${maturity.overallLevel}`,
        description: `Marco de maturidade organizacional: ${maturity.overallLevel}.`,
        status: "achieved",
        achievedAt: new Date().toISOString(),
        explainable: true,
      })
    )
  );
  for (const event of (timeline.events ?? []).slice(0, 2)) {
    milestones.push(
      upsertDnaMilestone(
        Object.freeze({
          milestoneId: `bmil-${tenantId}-${event.id}`,
          tenantId,
          label: event.label,
          description: event.context,
          status: "achieved",
          achievedAt: event.when,
          explainable: true,
        })
      )
    );
  }
  appendDnaAuditEntry({
    tenantId,
    action: "milestones_registered",
    entityType: "milestone",
  });
  return Object.freeze(milestones);
}

export default registerDnaMilestones;
