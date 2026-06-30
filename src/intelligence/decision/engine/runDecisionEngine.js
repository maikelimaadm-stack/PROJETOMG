import { ENTERPRISE_DECISION_ENGINE_VERSION } from "./decisionEngineContracts.js";
import { getDecisionEngineStoreInfo } from "./decisionEngineStore.js";
import { summarizeDecisionEngine } from "./decisionSummarization.js";
import { assembleDecisionContext } from "./decisionContextAssembly.js";
import { buildDecisionEngineBosProjection } from "./decisionToBosProjection.js";
import { bridgeDecisionToEvolution, bridgeDecisionToIntent } from "./decisionToIntelligenceBridges.js";
import { buildDecisionSeedsRegistry } from "./decisionSeedsRegistry.js";

export function runDecisionEngine(tenantId = "default") {
  return Object.freeze({
    engineVersion: ENTERPRISE_DECISION_ENGINE_VERSION,
    tenantId,
    storeInfo: getDecisionEngineStoreInfo(),
    summary: summarizeDecisionEngine(tenantId),
    context: assembleDecisionContext(tenantId),
    bosProjection: buildDecisionEngineBosProjection(tenantId),
    seeds: buildDecisionSeedsRegistry(tenantId),
    evolutionBridge: bridgeDecisionToEvolution(tenantId),
    intentBridge: bridgeDecisionToIntent(tenantId),
    decisionEngineReady: true,
    autonomousExecutionForbidden: true,
  });
}

export default runDecisionEngine;
