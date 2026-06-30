export function explainConsultingRecommendation(recommendation) {
  return Object.freeze({
    id: recommendation.recommendationId,
    title: recommendation.title,
    because: recommendation.explanation,
    expectedImpact: recommendation.expectedImpact,
    confidence: recommendation.confidence,
    priority: recommendation.priority,
    evidenceCount: recommendation.evidenceRefs?.length ?? 0,
    traceable: (recommendation.lineage?.length ?? 0) > 0,
    humanApprovalRequired: recommendation.humanApprovalRequired !== false,
    autonomousExecutionForbidden: recommendation.autonomousExecutionForbidden !== false,
  });
}

export function explainImprovementPlan(plan) {
  return Object.freeze({
    id: plan.planId,
    title: plan.title,
    objective: plan.objective,
    stepCount: plan.steps?.length ?? 0,
    expectedImpact: plan.expectedImpact,
    priority: plan.priority,
    humanApprovalRequired: plan.humanApprovalRequired !== false,
  });
}

export default { explainConsultingRecommendation, explainImprovementPlan };
