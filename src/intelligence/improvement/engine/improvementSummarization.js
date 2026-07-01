import { retrieveImprovementsByContext } from "./improvementRetrieval.js";
import { IMPROVEMENT_OWNERSHIP } from "./improvementEngineContracts.js";

export function summarizeImprovementEngine(tenantId = "default") {
  const retrieved = retrieveImprovementsByContext(tenantId);
  const activeCycles = retrieved.loops.filter((l) => l.lifecycleState === "in_cycle" || l.lifecycleState === "observing");
  const validatedImpact = retrieved.milestones.filter((m) => m.achieved && m.progressPercent === 100);

  const headline =
    retrieved.loops.length > 0
      ? `${activeCycles.length} ciclos de melhoria ativos — ${validatedImpact.length} impactos validados`
      : "Ciclos de melhoria contínua serão iniciados a partir de adoções e resultados operacionais.";

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    loopCount: retrieved.loops.length,
    activeCycleCount: activeCycles.length,
    opportunityCount: retrieved.opportunities.length,
    validatedImpactCount: validatedImpact.length,
    pendingValidationCount: retrieved.opportunities.filter((o) => o.priority === "high").length,
    headline,
    explainable: true,
    belongsToEnterprise: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    ...IMPROVEMENT_OWNERSHIP,
  });
}

export default summarizeImprovementEngine;
