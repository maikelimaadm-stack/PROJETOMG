import { summarizeDecisionEngine } from "./decisionSummarization.js";
import { buildDecisionSeedsRegistry } from "./decisionSeedsRegistry.js";
import { retrieveDecisionsByContext } from "./decisionRetrieval.js";
import { runEvolutionEngine } from "../../evolution/engine/runEvolutionEngine.js";

export function bridgeDecisionToEvolution(tenantId = "default") {
  const evolution = runEvolutionEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    seeds: buildDecisionSeedsRegistry(tenantId),
    summary: summarizeDecisionEngine(tenantId),
    evolutionSummary: evolution.summary,
    evolutionEngineReady: true,
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
