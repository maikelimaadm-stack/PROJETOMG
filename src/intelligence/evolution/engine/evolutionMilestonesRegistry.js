import { upsertEvolutionMilestone } from "./evolutionEngineStore.js";
import { appendEvolutionAuditEntry } from "./evolutionAuditTrail.js";

export function registerEvolutionMilestone(input) {
  const milestone = Object.freeze({
    milestoneId: input.milestoneId ?? `emil-${input.tenantId}-${Date.now()}`,
    tenantId: input.tenantId ?? "default",
    label: input.label ?? "Marco de evolução",
    description: input.description ?? "",
    achievedAt: input.achievedAt ?? null,
    targetAt: input.targetAt ?? null,
    status: input.status ?? "pending",
    recordedAt: new Date().toISOString(),
    explainable: true,
    autonomousExecutionForbidden: true,
  });
  upsertEvolutionMilestone(milestone);
  appendEvolutionAuditEntry({
    tenantId: milestone.tenantId,
    action: "milestone_registered",
    entityId: milestone.milestoneId,
    entityType: "milestone",
  });
  return milestone;
}

export default registerEvolutionMilestone;
