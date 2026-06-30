import { summarizeEvolutionEngine } from "./evolutionSummarization.js";
import { buildEvolutionSeedsRegistry } from "./evolutionSeedsRegistry.js";
import { retrieveEvolutionByContext } from "./evolutionRetrieval.js";

export function bridgeEvolutionToConsulting(tenantId = "default") {
  const retrieved = retrieveEvolutionByContext(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    evolutionPlans: retrieved.plans,
    summary: summarizeEvolutionEngine(tenantId),
    consultingBridgeReady: false,
    autonomousAdviceForbidden: true,
  });
}

export function bridgeEvolutionToDecision(tenantId = "default") {
  const retrieved = retrieveEvolutionByContext(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    milestones: retrieved.milestones,
    seeds: buildEvolutionSeedsRegistry(tenantId),
    decisionBridgeReady: false,
    autonomousDecisionForbidden: true,
  });
}

export function bridgeEvolutionToIntent(tenantId = "default") {
  const retrieved = retrieveEvolutionByContext(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    opportunities: retrieved.documents,
    plans: retrieved.plans.slice(0, 5),
    intentBridgeReady: false,
    autonomousIntentForbidden: true,
  });
}

export default { bridgeEvolutionToConsulting, bridgeEvolutionToDecision, bridgeEvolutionToIntent };
