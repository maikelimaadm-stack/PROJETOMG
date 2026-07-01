import { retrieveAdoptionsByContext } from "./adoptionRetrieval.js";
import { ADOPTION_OWNERSHIP } from "./adoptionEngineContracts.js";

export function summarizeAdoptionEngine(tenantId = "default") {
  const retrieved = retrieveAdoptionsByContext(tenantId);
  const { statusBreakdown, progress } = retrieved;

  const headline =
    retrieved.adoptions.length > 0
      ? `${statusBreakdown.acceptedCount} adoções aceitas, ${statusBreakdown.inProgressCount} em andamento — progresso ${progress.overallProgressPercent}%`
      : "Acompanhamento de adoção será iniciado quando recomendações forem registradas.";

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    adoptionCount: retrieved.adoptions.length,
    acceptedCount: statusBreakdown.acceptedCount,
    rejectedCount: statusBreakdown.rejectedCount,
    inProgressCount: statusBreakdown.inProgressCount,
    pendingCount: statusBreakdown.pendingCount,
    overallProgressPercent: progress.overallProgressPercent,
    validatedOutcomeCount: retrieved.outcomes.filter((o) => o.validated).length,
    pendingValidationCount: retrieved.outcomes.filter((o) => o.pendingValidation).length,
    headline,
    explainable: true,
    belongsToEnterprise: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
    ...ADOPTION_OWNERSHIP,
  });
}

export default summarizeAdoptionEngine;
