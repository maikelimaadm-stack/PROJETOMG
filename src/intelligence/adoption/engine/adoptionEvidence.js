import { upsertAdoptionEvidence } from "./adoptionEngineStore.js";
import { appendAdoptionAuditEntry } from "./adoptionAuditTrail.js";

export function registerAdoptionEvidence(tenantId, adoptions, ctx) {
  const evidence = [];

  for (const adoption of adoptions.slice(0, 5)) {
    evidence.push(
      upsertAdoptionEvidence(
        Object.freeze({
          evidenceId: `aevid-${tenantId}-${adoption.adoptionId}`,
          tenantId,
          adoptionId: adoption.adoptionId,
          recommendationId: adoption.recommendationId,
          label: `Evidência de acompanhamento: ${adoption.title}`,
          summary: `Acompanhamento baseado em recomendação operacional da empresa.`,
          sourceRefs: Object.freeze([
            Object.freeze({ type: "recommendation", refId: adoption.recommendationId }),
            Object.freeze({ type: "dna", refId: ctx.dnaSummary?.headline ?? "dna-context" }),
          ]),
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendAdoptionAuditEntry({
    tenantId,
    action: "evidence_registered",
    entityType: "evidence",
  });

  return Object.freeze({ evidence });
}

export default registerAdoptionEvidence;
