import { summarizeConsultingEngine } from "./consultingSummarization.js";
import { retrieveConsultingByContext } from "./consultingRetrieval.js";
import { explainConsultingRecommendation, explainImprovementPlan } from "./consultingExplainability.js";
import { analyzeConsultingContext } from "./graphToConsultingIngestion.js";

/** Consulting-to-BOS projections — business vocabulary, no AI jargon */
export function buildConsultingEngineBosProjection(tenantId = "default") {
  let summary = summarizeConsultingEngine(tenantId);
  if (summary.recommendationCount === 0) {
    analyzeConsultingContext(tenantId);
    summary = summarizeConsultingEngine(tenantId);
  }
  const retrieved = retrieveConsultingByContext(tenantId);
  const hasConsulting = retrieved.recommendations.length > 0 || retrieved.plans.length > 0;

  const opportunities = retrieved.documents
    .filter((d) => d.documentType === "consulting.document.opportunity")
    .slice(0, 5)
    .map((d) =>
      Object.freeze({
        id: d.documentId,
        label: d.title,
        context: d.summary,
      })
    );

  const recommendations = retrieved.recommendations.slice(0, 5).map((r) => {
    const explained = explainConsultingRecommendation(r);
    return Object.freeze({
      id: r.recommendationId,
      label: r.title,
      explanation: r.explanation,
      expectedImpact: r.expectedImpact,
      priority: r.priority,
      confidence: r.confidence,
      evidenceCount: explained.evidenceCount,
      because: r.explanation,
    });
  });

  const plans = retrieved.plans.slice(0, 3).map((p) => {
    const explained = explainImprovementPlan(p);
    return Object.freeze({
      id: p.planId,
      label: p.title,
      objective: p.objective,
      expectedImpact: p.expectedImpact,
      priority: p.priority,
      stepCount: explained.stepCount,
      nextSteps: (p.steps ?? []).slice(0, 3).map((s) => s.label),
    });
  });

  const priorities = retrieved.recommendations
    .filter((r) => r.priority === "high" || r.priority === "critical")
    .slice(0, 3)
    .map((r) =>
      Object.freeze({
        id: r.recommendationId,
        label: r.title,
        priority: r.priority,
      })
    );

  const evidenceHighlights = retrieved.recommendations.slice(0, 3).map((r) =>
    Object.freeze({
      id: r.recommendationId,
      title: r.title,
      because: r.explanation,
      impact: r.expectedImpact,
      confidence: r.confidence,
    })
  );

  const evolutionTracking = retrieved.plans.slice(0, 2).map((p) =>
    Object.freeze({
      id: p.planId,
      label: p.title,
      status: p.lifecycleState,
      objective: p.objective,
    })
  );

  return Object.freeze({
    hasConsulting,
    summary: summary.headline,
    consultingSummary: summary,
    opportunities,
    recommendations,
    improvementPlans: plans,
    suggestedPriorities: priorities,
    evidenceHighlights,
    evolutionTracking,
    explainable: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildConsultingEngineBosProjection;
