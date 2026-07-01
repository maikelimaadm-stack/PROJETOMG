import { upsertImprovementMilestone } from "./improvementEngineStore.js";
import { appendImprovementAuditEntry } from "./improvementAuditTrail.js";

const TEMPLATES = Object.freeze([
  { label: "Sinal identificado", progressPercent: 20 },
  { label: "Oportunidade aprovada", progressPercent: 40 },
  { label: "Ciclo em andamento", progressPercent: 60 },
  { label: "Impacto medido", progressPercent: 80 },
  { label: "Melhoria validada", progressPercent: 100 },
]);

export function buildImprovementMilestones(tenantId, loops) {
  const milestones = [];

  for (const loop of loops.slice(0, 5)) {
    const progress = loop.impactScore ?? 0;
    for (const template of TEMPLATES) {
      const achieved = progress >= template.progressPercent;
      milestones.push(
        upsertImprovementMilestone(
          Object.freeze({
            milestoneId: `imile-${tenantId}-${loop.loopId}-${template.progressPercent}`,
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

  appendImprovementAuditEntry({ tenantId, action: "milestones_built", entityType: "milestone" });

  return Object.freeze({ milestones });
}

export default buildImprovementMilestones;
