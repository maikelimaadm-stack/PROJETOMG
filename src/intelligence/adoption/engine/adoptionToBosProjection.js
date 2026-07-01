/**
 * Adoption → BOS projection — business vocabulary only.
 */
import { summarizeAdoptionEngine } from "./adoptionSummarization.js";
import { retrieveLatestAdoptions } from "./adoptionRetrieval.js";
import { analyzeAdoptionContext } from "./recommendationToAdoptionIngestion.js";
import { explainAdoption } from "./adoptionExplainability.js";
import { buildAdoptionTimeline } from "./adoptionTimeline.js";

export function buildAdoptionBosProjection(tenantId = "default", options = {}) {
  let summary = summarizeAdoptionEngine(tenantId);
  if (summary.adoptionCount === 0) {
    analyzeAdoptionContext(tenantId, options);
    summary = summarizeAdoptionEngine(tenantId);
  }

  const retrieved = retrieveLatestAdoptions(tenantId);
  const timeline = buildAdoptionTimeline(tenantId);
  const { statusBreakdown } = retrieved;

  const adoptedRecommendations = statusBreakdown.accepted
    .concat(statusBreakdown.inProgress)
    .slice(0, 5)
    .map((a) => {
      const explained = explainAdoption(a);
      return Object.freeze({
        id: a.adoptionId,
        label: a.title,
        context: a.summary,
        status: explained.statusLabel,
        progressPercent: a.progressPercent,
        because: explained.because,
        requiresHumanApproval: true,
      });
    });

  const rejectedRecommendations = statusBreakdown.rejected.slice(0, 3).map((a) => {
    const explained = explainAdoption(a);
    return Object.freeze({
      id: a.adoptionId,
      label: a.title,
      context: a.summary,
      status: explained.statusLabel,
      because: explained.because,
    });
  });

  const plansInProgress = retrieved.plans
    .filter((p) => p.status === "adoption.status.in_progress" || p.status === "adoption.status.accepted")
    .slice(0, 3)
    .map((p) =>
      Object.freeze({
        id: p.planId,
        label: p.title,
        objective: p.objective,
        stepCount: p.steps?.length ?? 0,
        requiresHumanApproval: true,
      })
    );

  const replicatedPractices = retrieved.adoptions
    .filter((a) => a.replicationId || a.progressPercent >= 80)
    .slice(0, 3)
    .map((a) =>
      Object.freeze({
        id: a.adoptionId,
        label: a.title,
        context: a.summary,
        progressPercent: a.progressPercent,
        requiresHumanApproval: true,
      })
    );

  const validatedOutcomes = retrieved.outcomes
    .filter((o) => o.validated)
    .slice(0, 3)
    .map((o) =>
      Object.freeze({
        id: o.outcomeId,
        label: o.label,
        impact: o.impactSummary,
      })
    );

  const pendingValidation = retrieved.outcomes
    .filter((o) => o.pendingValidation)
    .slice(0, 3)
    .map((o) =>
      Object.freeze({
        id: o.outcomeId,
        label: o.label,
        context: o.impactSummary,
      })
    );

  const milestones = retrieved.milestones
    .filter((m) => m.achieved)
    .slice(0, 5)
    .map((m) =>
      Object.freeze({
        id: m.milestoneId,
        label: m.label,
        progressPercent: m.progressPercent,
      })
    );

  return Object.freeze({
    hasAdoptions: summary.adoptionCount > 0,
    summary: summary.headline,
    adoptionSummary: summary,
    adoptedRecommendations,
    rejectedRecommendations,
    plansInProgress,
    replicatedPractices,
    validatedOutcomes,
    pendingValidation,
    milestones,
    adoptionTimeline: timeline.entries,
    overallProgressPercent: summary.overallProgressPercent,
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
  });
}

export default buildAdoptionBosProjection;
