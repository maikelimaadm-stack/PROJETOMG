import { listAdoptions, listAdoptionOutcomes } from "../../adoption/engine/adoptionEngineStore.js";
import { listRecommendations } from "../../recommendation/engine/recommendationEngineStore.js";

export function trackRecommendationOutcomes(tenantId = "default") {
  const recommendations = listRecommendations(tenantId);
  const adoptions = listAdoptions(tenantId);
  const outcomes = listAdoptionOutcomes(tenantId);

  const tracked = recommendations.map((rec) => {
    const adoption = adoptions.find((a) => a.recommendationId === rec.recommendationId);
    const outcome = outcomes.find((o) => o.recommendationId === rec.recommendationId);
    return Object.freeze({
      recommendationId: rec.recommendationId,
      title: rec.title,
      adoptionStatus: adoption?.status ?? "pending",
      progressPercent: adoption?.progressPercent ?? 0,
      impactValidated: outcome?.validated ?? false,
      pendingValidation: outcome?.pendingValidation ?? false,
      requiresHumanApproval: true,
    });
  });

  const accepted = tracked.filter(
    (t) => t.adoptionStatus === "adoption.status.accepted" || t.adoptionStatus === "adoption.status.in_progress"
  );
  const rejected = tracked.filter((t) => t.adoptionStatus === "adoption.status.rejected");
  const withImpact = tracked.filter((t) => t.impactValidated);

  return Object.freeze({
    tenantId,
    trackedAt: new Date().toISOString(),
    outcomes: Object.freeze(tracked),
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    impactValidatedCount: withImpact.length,
    explainable: true,
  });
}

export default trackRecommendationOutcomes;
