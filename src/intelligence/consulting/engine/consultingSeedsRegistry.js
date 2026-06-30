import { listConsultingRecommendations, listImprovementPlans } from "./consultingEngineStore.js";
import { listEngineConsultingSignals } from "./consultingEngineStore.js";
import { summarizeConsultingEngine } from "./consultingSummarization.js";

export function buildConsultingSeedsRegistry(tenantId = "default") {
  const summary = summarizeConsultingEngine(tenantId);
  const recommendations = listConsultingRecommendations(tenantId, { limit: 10 });
  const plans = listImprovementPlans(tenantId, { limit: 5 });
  const signals = listEngineConsultingSignals(tenantId, { limit: 10 });

  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    seedCount: recommendations.length + plans.length + signals.length,
    recommendationSeeds: recommendations.map((r) =>
      Object.freeze({ id: r.recommendationId, title: r.title, priority: r.priority })
    ),
    planSeeds: plans.map((p) => Object.freeze({ id: p.planId, title: p.title })),
    signalSeeds: signals.map((s) => Object.freeze({ id: s.signalId, type: s.signalType })),
    summary,
    forDecisionEngine: false,
    forEvolutionEngine: false,
  });
}

export default buildConsultingSeedsRegistry;
