import { summarizeDecisionEngine } from "./decisionSummarization.js";
import { buildDecisionSeedsRegistry } from "./decisionSeedsRegistry.js";
import { retrieveDecisionsByContext } from "./decisionRetrieval.js";

export function bridgeDecisionToEvolution(tenantId = "default") {
  const retrieved = retrieveDecisionsByContext(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    approvedDecisions: retrieved.documents.filter((d) => d.lifecycleState === "approved"),
    seeds: buildDecisionSeedsRegistry(tenantId),
    summary: summarizeDecisionEngine(tenantId),
    evolutionEngineReady: false,
    autoEvolutionForbidden: true,
  });
}

export function bridgeDecisionToIntent(tenantId = "default") {
  const retrieved = retrieveDecisionsByContext(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    pendingDecisions: retrieved.pendingDecisions,
    options: retrieved.options.slice(0, 10),
    intentBridgeReady: false,
    autonomousIntentForbidden: true,
  });
}

export default { bridgeDecisionToEvolution, bridgeDecisionToIntent };
