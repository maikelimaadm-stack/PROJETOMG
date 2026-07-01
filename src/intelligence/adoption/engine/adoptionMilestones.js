import { upsertAdoptionMilestone } from "./adoptionEngineStore.js";
import { appendAdoptionAuditEntry } from "./adoptionAuditTrail.js";

const MILESTONE_TEMPLATES = Object.freeze([
  { label: "Recomendação revisada", progressPercent: 20 },
  { label: "Aceite humano registrado", progressPercent: 40 },
  { label: "Implementação iniciada", progressPercent: 60 },
  { label: "Prática replicada com sucesso", progressPercent: 80 },
  { label: "Impacto validado", progressPercent: 100 },
]);

export function buildAdoptionMilestones(tenantId, adoptions) {
  const milestones = [];

  for (const adoption of adoptions.slice(0, 5)) {
    for (const template of MILESTONE_TEMPLATES) {
      const achieved = adoption.progressPercent >= template.progressPercent;
      milestones.push(
        upsertAdoptionMilestone(
          Object.freeze({
            milestoneId: `amile-${tenantId}-${adoption.adoptionId}-${template.progressPercent}`,
            tenantId,
            adoptionId: adoption.adoptionId,
            label: template.label,
            progressPercent: template.progressPercent,
            achieved,
            achievedAt: achieved ? new Date().toISOString() : null,
            requiresHumanConfirmation: true,
            explainable: true,
            recordedAt: new Date().toISOString(),
          })
        )
      );
    }
  }

  appendAdoptionAuditEntry({
    tenantId,
    action: "milestones_built",
    entityType: "milestone",
  });

  return Object.freeze({ milestones });
}

export default buildAdoptionMilestones;
