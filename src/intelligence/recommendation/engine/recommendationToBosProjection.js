/**
 * Recommendation → BOS projection — business vocabulary only.
 */
import { summarizeRecommendationEngine } from "./recommendationSummarization.js";
import { summarizeReplicationEngine } from "./replicationSummarization.js";
import { retrieveLatestRecommendations, retrieveReplicationsByContext } from "./recommendationRetrieval.js";
import { analyzeRecommendationContext } from "./segmentationToRecommendationIngestion.js";
import { explainRecommendation, explainReplication } from "./recommendationExplainability.js";

export function buildRecommendationBosProjection(tenantId = "default", options = {}) {
  let summary = summarizeRecommendationEngine(tenantId);
  if (summary.recommendationCount === 0) {
    analyzeRecommendationContext(tenantId, options);
    summary = summarizeRecommendationEngine(tenantId);
  }

  const retrieved = retrieveLatestRecommendations(tenantId);
  const replicationRetrieved = retrieveReplicationsByContext(tenantId);
  const replicationSummary = summarizeReplicationEngine(tenantId);

  const priorityRecommendations = retrieved.recommendations
    .filter((r) => r.priority === "high" || r.priority === "medium")
    .slice(0, 5)
    .map((r) => {
      const explained = explainRecommendation(r);
      return Object.freeze({
        id: r.recommendationId,
        label: r.title,
        context: r.summary,
        expectedImpact: r.expectedImpact,
        confidence: r.confidence,
        because: explained.because,
        requiresHumanApproval: true,
      });
    });

  const suggestedPlans = retrieved.plans.slice(0, 3).map((p) =>
    Object.freeze({
      id: p.planId,
      label: p.title,
      objective: p.objective,
      stepCount: p.steps?.length ?? 0,
      requiresHumanApproval: true,
    })
  );

  const replicablePractices = replicationRetrieved.replications.slice(0, 5).map((r) => {
    const explained = explainReplication(r);
    return Object.freeze({
      id: r.replicationId,
      label: r.title,
      context: r.summary,
      compatibility: r.compatibilityScore,
      sourceTenant: r.sourceTenantId,
      because: explained.because,
      requiresHumanApproval: true,
      howToReplicateSafely: "Revisar prática de origem, validar compatibilidade e aprovar antes de adotar.",
    });
  });

  const nextSteps = priorityRecommendations.length
    ? Object.freeze({
        label: "Revisar recomendação prioritária",
        context: priorityRecommendations[0].label,
        requiresHuman: true,
      })
    : null;

  return Object.freeze({
    hasRecommendations: summary.recommendationCount > 0,
    summary: summary.headline,
    recommendationSummary: summary,
    priorityRecommendations,
    suggestedPlans,
    replicablePractices,
    replicationSummary: replicationSummary.headline,
    nextSteps,
    whyRecommended: retrieved.signals.slice(0, 3).map((s) =>
      Object.freeze({
        id: s.signalId,
        title: s.label,
        because: s.summary,
      })
    ),
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
  });
}

export function buildReplicationBosProjection(tenantId = "default", options = {}) {
  const recProjection = buildRecommendationBosProjection(tenantId, options);
  return Object.freeze({
    ...recProjection,
    replicationPlans: retrieveReplicationsByContext(tenantId).plans.slice(0, 3).map((p) =>
      Object.freeze({
        id: p.planId,
        label: p.title,
        objective: p.objective,
        requiresHumanApproval: true,
      })
    ),
  });
}

export default buildRecommendationBosProjection;
