import { upsertAdoptionOutcome } from "./adoptionEngineStore.js";
import { ADOPTION_STATUS_TYPES } from "./adoptionEngineContracts.js";
import { appendAdoptionAuditEntry } from "./adoptionAuditTrail.js";

export function registerAdoptionOutcomes(tenantId, adoptions) {
  const outcomes = [];

  for (const adoption of adoptions.slice(0, 5)) {
    const validated = adoption.status === ADOPTION_STATUS_TYPES.COMPLETED;
    const pendingValidation = adoption.status === ADOPTION_STATUS_TYPES.VALIDATING;

    outcomes.push(
      upsertAdoptionOutcome(
        Object.freeze({
          outcomeId: `aout-${tenantId}-${adoption.adoptionId}`,
          tenantId,
          adoptionId: adoption.adoptionId,
          recommendationId: adoption.recommendationId,
          label: validated
            ? `Impacto validado: ${adoption.title}`
            : pendingValidation
              ? `Aguardando validação: ${adoption.title}`
              : `Impacto pendente: ${adoption.title}`,
          impactSummary: validated
            ? "Melhoria adotada com impacto operacional confirmado pela empresa."
            : pendingValidation
              ? "Implementação concluída — aguardando validação de impacto."
              : "Adoção em andamento — impacto ainda não validado.",
          validated,
          pendingValidation,
          requiresHumanConfirmation: true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendAdoptionAuditEntry({
    tenantId,
    action: "outcomes_registered",
    entityType: "outcome",
  });

  return Object.freeze({ outcomes });
}

export default registerAdoptionOutcomes;
