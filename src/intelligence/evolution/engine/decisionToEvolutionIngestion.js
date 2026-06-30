import { EVOLUTION_DOCUMENT_TYPES, EVOLUTION_SIGNAL_TYPES } from "./evolutionEngineContracts.js";
import { assembleEvolutionContext } from "./evolutionContextAssembly.js";
import { buildEvolutionLineage } from "./evolutionLineage.js";
import { computeEvolutionMaturity } from "./evolutionMaturityModel.js";
import { buildEvolutionTimeline } from "./evolutionTimeline.js";
import { registerEvolutionSignal } from "./evolutionSignalsRegistry.js";
import { registerEvolutionOpportunity } from "./evolutionOpportunityRegistry.js";
import { buildEvolutionPlan } from "./evolutionPlanBuilder.js";
import { buildEvolutionRoadmap } from "./roadmapBuilder.js";
import { registerEvolutionMilestone } from "./evolutionMilestonesRegistry.js";
import { trackEvolutionProgress } from "./progressTracker.js";
import { createEvolutionDocument, upsertEvolutionDocument } from "./evolutionEngineStore.js";
import { appendEvolutionAuditEntry } from "./evolutionAuditTrail.js";
import { registerEvolutionVersion } from "./evolutionVersioning.js";
import { summarizeEvolutionEngine } from "./evolutionSummarization.js";
import { replayDecisionFromStack } from "../../decision/engine/consultingToDecisionIngestion.js";

/** Analyze full stack and produce evolution artifacts */
export function analyzeEvolutionContext(tenantId = "default") {
  const ctx = assembleEvolutionContext(tenantId);
  const maturity = computeEvolutionMaturity(ctx);
  const timeline = buildEvolutionTimeline(tenantId);
  const signals = [];
  const plans = [];

  if (maturity.overallLevel === "advanced" || maturity.overallLevel === "established") {
    signals.push(
      registerEvolutionSignal({
        tenantId,
        signalType: EVOLUTION_SIGNAL_TYPES.MATURITY_GAIN,
        summary: `Maturidade organizacional em nível ${maturity.overallLevel}.`,
        memoryIds: [],
        decisionIds: ctx.decisionRetrieved?.documents?.slice(0, 2).map((d) => d.decisionId),
      })
    );
  }

  if (timeline.eventCount >= 3) {
    signals.push(
      registerEvolutionSignal({
        tenantId,
        signalType: EVOLUTION_SIGNAL_TYPES.TREND,
        summary: `${timeline.eventCount} eventos de evolução registrados na linha do tempo.`,
      })
    );
  }

  for (const opp of ctx.opportunities ?? []) {
    registerEvolutionOpportunity({
      tenantId,
      title: opp.title,
      summary: opp.explanation,
      evidenceRefs: [{ type: "improvement.opportunity", refId: opp.opportunityId }],
    });
  }

  const approvedDecisions = ctx.decisionRetrieved?.documents?.filter((d) => d.lifecycleState === "approved") ?? [];
  if (approvedDecisions.length > 0 || (ctx.consultingRetrieved?.plans?.length ?? 0) > 0) {
    const plan = buildEvolutionPlan({
      tenantId,
      title: "Plano de evolução contínua",
      objective: "Amadurecer capacidades operacionais com base em decisões e consultoria.",
      expectedImpact: "Progresso mensurável na maturidade organizacional.",
      confidence: maturity.score >= 4 ? "high" : "medium",
    });
    plans.push(plan);
    trackEvolutionProgress({
      tenantId,
      planId: plan.planId,
      label: plan.title,
      percentComplete: Math.min(maturity.score * 15, 90),
      status: "tracking",
    });
  }

  const roadmap = buildEvolutionRoadmap({
    tenantId,
    milestones: maturity.capabilities.map((c, i) =>
      Object.freeze({ order: i + 1, label: c.label, level: c.level })
    ),
  });

  registerEvolutionMilestone({
    tenantId,
    label: `Maturidade ${maturity.overallLevel}`,
    description: `Nível atual de maturidade organizacional: ${maturity.overallLevel}.`,
    status: "achieved",
    achievedAt: new Date().toISOString(),
  });

  const analysisDoc = createEvolutionDocument({
    tenantId,
    documentType: EVOLUTION_DOCUMENT_TYPES.ANALYSIS,
    title: "Análise de evolução organizacional",
    summary: summarizeEvolutionEngine(tenantId).headline,
    maturityLevel: maturity.overallLevel,
    lineage: buildEvolutionLineage({
      memoryIds: (ctx.memoryContext?.recentDecisions ?? []).slice(0, 2).map((d) => d.memoryId),
      decisionIds: approvedDecisions.slice(0, 2).map((d) => d.decisionId),
      consultingIds: (ctx.consultingRetrieved?.recommendations ?? []).slice(0, 2).map((r) => r.recommendationId),
    }),
  });
  registerEvolutionVersion(tenantId, analysisDoc.evolutionId);
  upsertEvolutionDocument(analysisDoc);

  appendEvolutionAuditEntry({
    tenantId,
    action: "context_analyzed",
    entityId: analysisDoc.evolutionId,
    entityType: "analysis",
  });

  return Object.freeze({
    tenantId,
    analyzedAt: new Date().toISOString(),
    maturity,
    timeline,
    signals,
    plans,
    roadmap,
    analysisDocument: analysisDoc,
    explainable: true,
    autonomousExecutionForbidden: true,
  });
}

export function ingestDecisionToEvolution(tenantId) {
  return analyzeEvolutionContext(tenantId);
}

export function replayEvolutionFromStack(tenantId = "default") {
  replayDecisionFromStack(tenantId);
  const analysis = analyzeEvolutionContext(tenantId);
  return Object.freeze({
    tenantId,
    replayedAt: new Date().toISOString(),
    analysis,
    explainable: true,
  });
}

export default { analyzeEvolutionContext, ingestDecisionToEvolution, replayEvolutionFromStack };
