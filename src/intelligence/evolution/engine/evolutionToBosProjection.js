import { summarizeEvolutionEngine } from "./evolutionSummarization.js";
import { retrieveEvolutionByContext } from "./evolutionRetrieval.js";
import { explainEvolutionDocument, explainEvolutionPlan } from "./evolutionExplainability.js";
import { analyzeEvolutionContext } from "./decisionToEvolutionIngestion.js";
import { assembleEvolutionContext } from "./evolutionContextAssembly.js";
import { computeEvolutionMaturity } from "./evolutionMaturityModel.js";
import { buildEvolutionTimeline } from "./evolutionTimeline.js";
import { computeProgressSummary } from "./progressTracker.js";

/** Evolution-to-BOS projections — business vocabulary only */
export function buildEvolutionEngineBosProjection(tenantId = "default") {
  let summary = summarizeEvolutionEngine(tenantId);
  if (summary.documentCount === 0) {
    analyzeEvolutionContext(tenantId);
    summary = summarizeEvolutionEngine(tenantId);
  }

  const ctx = assembleEvolutionContext(tenantId);
  const maturity = computeEvolutionMaturity(ctx);
  const timeline = buildEvolutionTimeline(tenantId, 8);
  const retrieved = retrieveEvolutionByContext(tenantId);
  const progressSummary = computeProgressSummary(tenantId, retrieved.progress);

  const maturityByCapability = maturity.capabilities.map((c) =>
    Object.freeze({
      id: c.id,
      label: c.label,
      level: c.level,
    })
  );

  const evolutionTimeline = timeline.events.map((e) =>
    Object.freeze({
      id: e.id,
      label: e.label,
      context: e.context,
      when: e.when,
      tone: e.tone,
    })
  );

  const opportunities = retrieved.documents.slice(0, 5).map((d) => {
    const explained = explainEvolutionDocument(d);
    return Object.freeze({
      id: d.evolutionId,
      label: d.title,
      context: d.summary,
      maturityLevel: d.maturityLevel,
    });
  });

  const evolutionPlans = retrieved.plans.slice(0, 3).map((p) => {
    const explained = explainEvolutionPlan(p);
    return Object.freeze({
      id: p.planId,
      label: p.title,
      objective: p.objective,
      expectedImpact: p.expectedImpact,
      stepCount: explained.stepCount,
    });
  });

  const milestones = retrieved.milestones.slice(0, 5).map((m) =>
    Object.freeze({
      id: m.milestoneId,
      label: m.label,
      status: m.status,
      description: m.description,
    })
  );

  const suggestedPaths = retrieved.roadmaps.slice(0, 2).flatMap((r) =>
    (r.phases ?? []).slice(0, 3).map((phase) =>
      Object.freeze({
        id: `${r.roadmapId}-${phase.order}`,
        label: phase.label,
        status: phase.status,
      })
    )
  );

  const periodComparison = Object.freeze({
    currentProgress: progressSummary.averageProgress,
    trackingCount: progressSummary.trackingCount,
    maturityLevel: maturity.overallLevel,
    eventCount: timeline.eventCount,
  });

  const accumulatedDecisionImpact = (ctx.decisionRetrieved?.documents ?? [])
    .filter((d) => d.lifecycleState === "approved")
    .slice(0, 3)
    .map((d) =>
      Object.freeze({
        id: d.decisionId,
        label: d.title,
        impact: d.summary,
      })
    );

  const nextSteps = evolutionPlans.length
    ? Object.freeze({
        label: "Continuar evolução",
        context: evolutionPlans[0].label,
        requiresHuman: true,
      })
    : null;

  const whyRecommended = retrieved.signals.slice(0, 3).map((s) =>
    Object.freeze({
      id: s.signalId,
      title: s.summary,
      because: "Sinal de evolução identificado a partir da operação.",
    })
  );

  return Object.freeze({
    hasEvolution: retrieved.documents.length > 0 || maturity.score > 0,
    summary: summary.headline,
    evolutionSummary: summary,
    maturityLevel: maturity.overallLevel,
    maturityByCapability,
    evolutionTimeline,
    opportunities,
    evolutionPlans,
    milestones,
    suggestedPaths,
    periodComparison,
    accumulatedDecisionImpact,
    progressSummary,
    nextSteps,
    whyRecommended,
    explainable: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildEvolutionEngineBosProjection;
