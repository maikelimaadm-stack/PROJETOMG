import { summarizeConsultingEngine } from "./consultingSummarization.js";
import { buildConsultingSeedsRegistry } from "./consultingSeedsRegistry.js";
import { retrieveConsultingByContext } from "./consultingRetrieval.js";
import { listImprovementPlans } from "./consultingEngineStore.js";

export function bridgeConsultingToDecision(tenantId = "default") {
  const retrieved = retrieveConsultingByContext(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    recommendations: retrieved.recommendations,
    plans: retrieved.plans,
    summary: summarizeConsultingEngine(tenantId),
    decisionEngineReady: false,
    autonomousDecisionForbidden: true,
  });
}

export function bridgeConsultingToEvolution(tenantId = "default") {
  const plans = listImprovementPlans(tenantId, { limit: 10 });
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    improvementPlans: plans,
    seeds: buildConsultingSeedsRegistry(tenantId),
    evolutionEngineReady: false,
    autoEvolutionForbidden: true,
  });
}

export function bridgeConsultingToIntent(tenantId = "default") {
  const retrieved = retrieveConsultingByContext(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    opportunities: retrieved.documents,
    recommendations: retrieved.recommendations.slice(0, 5),
    intentBridgeReady: false,
    autonomousIntentForbidden: true,
  });
}

export default { bridgeConsultingToDecision, bridgeConsultingToEvolution, bridgeConsultingToIntent };
