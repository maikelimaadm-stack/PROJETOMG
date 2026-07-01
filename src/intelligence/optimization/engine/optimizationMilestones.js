import { upsertOptimizationMilestone } from "./optimizationEngineStore.js";
import { appendOptimizationAuditEntry } from "./optimizationAuditTrail.js";

const TEMPLATES = Object.freeze([
  { label: "Oportunidade identificada", progressPercent: 25 },
  { label: "Loop aprovado", progressPercent: 50 },
  { label: "Otimização em curso", progressPercent: 75 },
  { label: "Atrito reduzido", progressPercent: 100 },
]);

export function buildOptimizationMilestones(tenantId, loops) {
  const milestones = [];

  for (const loop of loops.slice(0, 5)) {
    const friction = loop.frictionScore ?? 50;
    const progress = Math.max(0, 100 - friction);
    for (const template of TEMPLATES) {
      const achieved = progress >= template.progressPercent;
      milestones.push(
        upsertOptimizationMilestone(
          Object.freeze({
            milestoneId: `omile-${tenantId}-${loop.loopId}-${template.progressPercent}`,
            tenantId,
            loopId: loop.loopId,
            label: template.label,
            progressPercent: template.progressPercent,
            achieved,
            requiresHumanConfirmation: true,
            explainable: true,
            recordedAt: new Date().toISOString(),
          })
        )
      );
    }
  }

  appendOptimizationAuditEntry({ tenantId, action: "milestones_built", entityType: "milestone" });

  return Object.freeze({ milestones });
}

export default buildOptimizationMilestones;
