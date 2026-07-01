import { retrieveOptimizationsByContext } from "./optimizationRetrieval.js";
import { OPTIMIZATION_OWNERSHIP } from "./optimizationEngineContracts.js";

export function summarizeOptimizationEngine(tenantId = "default") {
  const retrieved = retrieveOptimizationsByContext(tenantId);
  const activeLoops = retrieved.loops.filter((l) => l.lifecycleState === "in_loop" || l.lifecycleState === "proposed");

  const headline =
    retrieved.loops.length > 0
      ? `${activeLoops.length} loops de otimização ativos — ${retrieved.opportunities.length} oportunidades identificadas`
      : "Loops de otimização serão gerados a partir de ciclos de melhoria e feedback de adoção.";

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    loopCount: retrieved.loops.length,
    activeLoopCount: activeLoops.length,
    opportunityCount: retrieved.opportunities.length,
    headline,
    explainable: true,
    belongsToEnterprise: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    ...OPTIMIZATION_OWNERSHIP,
  });
}

export default summarizeOptimizationEngine;
