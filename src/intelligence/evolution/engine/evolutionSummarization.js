import {
  listEvolutionDocuments,
  listEvolutionPlans,
  listEvolutionRoadmaps,
  listEvolutionMilestones,
  listEvolutionProgress,
} from "./evolutionEngineStore.js";

export function summarizeEvolutionEngine(tenantId = "default") {
  const documents = listEvolutionDocuments(tenantId, { limit: 200 });
  const plans = listEvolutionPlans(tenantId, { limit: 50 });
  const roadmaps = listEvolutionRoadmaps(tenantId, { limit: 20 });
  const milestones = listEvolutionMilestones(tenantId, { limit: 50 });
  const progress = listEvolutionProgress(tenantId, { limit: 100 });

  const avgProgress = progress.length
    ? Math.round(progress.reduce((s, p) => s + (p.percentComplete ?? 0), 0) / progress.length)
    : 0;

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    documentCount: documents.length,
    planCount: plans.length,
    roadmapCount: roadmaps.length,
    milestoneCount: milestones.length,
    progressCount: progress.length,
    averageProgress: avgProgress,
    headline:
      documents.length === 0
        ? "A evolução organizacional está pronta para acompanhar maturidade e progresso da empresa."
        : `${plans.length} plano(s) de evolução com ${avgProgress}% de progresso médio acompanhado.`,
    explainable: true,
    aiGenerated: false,
    belongsToEnterprise: true,
    autonomousExecutionForbidden: true,
  });
}

export default summarizeEvolutionEngine;
