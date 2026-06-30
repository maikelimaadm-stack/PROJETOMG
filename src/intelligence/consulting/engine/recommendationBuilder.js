import { buildConsultingLineage } from "./consultingLineage.js";
import { createConsultingRecommendation, upsertConsultingRecommendation } from "./consultingEngineStore.js";
import { appendConsultingAuditEntry } from "./consultingAuditTrail.js";
import { registerConsultingVersion } from "./consultingVersioning.js";

/** Build explainable recommendation — suggest only, never execute */
export function buildConsultingRecommendation(input) {
  const lineage = buildConsultingLineage(input);
  const rec = createConsultingRecommendation({
    tenantId: input.tenantId,
    title: input.title,
    explanation: input.explanation ?? input.summary ?? "",
    expectedImpact: input.expectedImpact ?? "Melhoria operacional esperada após aprovação humana.",
    priority: input.priority ?? "medium",
    confidence: input.confidence ?? "medium",
    evidenceRefs: input.evidenceRefs ?? [],
    lineage,
  });
  registerConsultingVersion(rec.tenantId, rec.recommendationId);
  upsertConsultingRecommendation(rec);
  appendConsultingAuditEntry({
    tenantId: rec.tenantId,
    action: "recommendation_created",
    entityId: rec.recommendationId,
    entityType: "recommendation",
  });
  return rec;
}

export default buildConsultingRecommendation;
