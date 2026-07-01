/**
 * Improvement → BOS projection — business vocabulary only.
 */
import { summarizeImprovementEngine } from "./improvementSummarization.js";
import { retrieveLatestImprovements } from "./improvementRetrieval.js";
import { analyzeImprovementContext } from "./adoptionToImprovementIngestion.js";
import { explainImprovementLoop, explainImprovementOpportunity } from "./improvementExplainability.js";
import { trackImprovementProgress } from "./improvementTracking.js";

export function buildImprovementBosProjection(tenantId = "default", options = {}) {
  let summary = summarizeImprovementEngine(tenantId);
  if (summary.loopCount === 0) {
    analyzeImprovementContext(tenantId, options);
    summary = summarizeImprovementEngine(tenantId);
  }

  const retrieved = retrieveLatestImprovements(tenantId);
  const tracking = trackImprovementProgress(tenantId);

  const activeCycles = retrieved.loops
    .filter((l) => l.lifecycleState === "in_cycle" || l.lifecycleState === "observing")
    .slice(0, 5)
    .map((l) => {
      const explained = explainImprovementLoop(l);
      return Object.freeze({
        id: l.loopId,
        label: l.title,
        context: l.summary,
        impactScore: l.impactScore,
        because: explained.because,
        requiresHumanApproval: true,
      });
    });

  const topOpportunities = retrieved.opportunities.slice(0, 5).map((o) => {
    const explained = explainImprovementOpportunity(o);
    return Object.freeze({
      id: o.opportunityId,
      label: o.title,
      context: o.summary,
      expectedImpact: o.expectedImpact,
      because: explained.because,
      requiresHumanApproval: true,
    });
  });

  const validatedImprovements = retrieved.milestones
    .filter((m) => m.achieved && m.progressPercent === 100)
    .slice(0, 5)
    .map((m) =>
      Object.freeze({
        id: m.milestoneId,
        label: m.label,
        progressPercent: m.progressPercent,
      })
    );

  const pendingEffect = retrieved.opportunities
    .filter((o) => o.priority === "high")
    .slice(0, 3)
    .map((o) =>
      Object.freeze({
        id: o.opportunityId,
        label: o.title,
        context: o.summary,
      })
    );

  const recurringPatterns = retrieved.signals.slice(0, 3).map((s) =>
    Object.freeze({
      id: s.signalId,
      label: s.label,
      context: s.summary,
    })
  );

  const benchmarks = retrieved.benchmarks.slice(0, 3).map((b) =>
    Object.freeze({
      id: b.benchmarkId,
      label: b.label,
      value: b.referenceValue,
      context: b.summary,
    })
  );

  const nextSteps =
    topOpportunities.length > 0
      ? Object.freeze({
          label: "Revisar oportunidade prioritária",
          context: topOpportunities[0].label,
          requiresHuman: true,
        })
      : null;

  return Object.freeze({
    hasImprovement: summary.loopCount > 0,
    summary: summary.headline,
    improvementSummary: summary,
    activeImprovementCycles: activeCycles,
    improvementOpportunities: topOpportunities,
    validatedImprovements,
    pendingEffectImprovements: pendingEffect,
    recurringImprovementPatterns: recurringPatterns,
    improvementBenchmarks: benchmarks,
    accumulatedImpact: summary.validatedImpactCount,
    improvementNextSteps: nextSteps,
    improvementTracking: Object.freeze({
      loopCount: tracking.loopCount,
      achievedMilestoneCount: tracking.achievedMilestoneCount,
    }),
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
  });
}

export default buildImprovementBosProjection;
