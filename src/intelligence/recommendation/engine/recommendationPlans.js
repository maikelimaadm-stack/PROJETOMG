import { upsertRecommendationPlan, createRecommendation, upsertRecommendation } from "./recommendationEngineStore.js";
import { buildRecommendationLineage } from "./replicationLineage.js";
import { registerRecommendationVersion } from "./recommendationVersioning.js";
import { appendRecommendationAuditEntry } from "./recommendationAuditTrail.js";

export function buildRecommendationPlans(tenantId, candidates) {
  const recommendations = [];
  const plans = [];

  for (const candidate of candidates.slice(0, 5)) {
    const rec = createRecommendation({
      tenantId,
      title: candidate.title,
      summary: candidate.summary,
      expectedImpact: candidate.expectedImpact,
      confidence: candidate.confidence,
      priority: candidate.priority,
      lineage: candidate.lineage ?? buildRecommendationLineage({}),
      evidenceRefs: Object.freeze([
        Object.freeze({ type: "candidate", refId: candidate.candidateId }),
      ]),
    });
    upsertRecommendation(rec);
    registerRecommendationVersion(tenantId, rec.recommendationId);
    recommendations.push(rec);

    plans.push(
      upsertRecommendationPlan(
        Object.freeze({
          planId: `rplan-${tenantId}-${candidate.candidateId}`,
          tenantId,
          recommendationId: rec.recommendationId,
          title: `Plano: ${candidate.title}`,
          objective: candidate.summary,
          steps: Object.freeze([
            Object.freeze({ order: 1, label: "Revisar recomendação", requiresHuman: true }),
            Object.freeze({ order: 2, label: "Aprovar ação", requiresHuman: true }),
            Object.freeze({ order: 3, label: "Acompanhar evolução", requiresHuman: true }),
          ]),
          requiresHumanApproval: true,
          autonomousExecutionForbidden: true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendRecommendationAuditEntry({
    tenantId,
    action: "plans_built",
    entityType: "plan",
  });

  return Object.freeze({ recommendations, plans });
}

export default buildRecommendationPlans;
