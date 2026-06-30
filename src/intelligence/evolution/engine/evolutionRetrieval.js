import {
  listEvolutionDocuments,
  listEvolutionPlans,
  listEvolutionRoadmaps,
  listEvolutionSignals,
  listEvolutionMilestones,
  listEvolutionProgress,
} from "./evolutionEngineStore.js";

export function retrieveEvolutionByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    documents: listEvolutionDocuments(tenantId, { limit }),
    plans: listEvolutionPlans(tenantId, { limit }),
    roadmaps: listEvolutionRoadmaps(tenantId, { limit: 5 }),
    signals: listEvolutionSignals(tenantId, { limit }),
    milestones: listEvolutionMilestones(tenantId, { limit }),
    progress: listEvolutionProgress(tenantId, { limit }),
    explainable: true,
  });
}

export default retrieveEvolutionByContext;
