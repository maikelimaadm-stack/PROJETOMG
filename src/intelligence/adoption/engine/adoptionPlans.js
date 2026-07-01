import { ADOPTION_STATUS_TYPES } from "./adoptionEngineContracts.js";
import { upsertAdoptionPlan } from "./adoptionEngineStore.js";
import { appendAdoptionAuditEntry } from "./adoptionAuditTrail.js";

export function buildAdoptionPlans(tenantId, adoptions) {
  const plans = [];

  for (const adoption of adoptions.slice(0, 5)) {
    plans.push(
      upsertAdoptionPlan(
        Object.freeze({
          planId: `aplan-${tenantId}-${adoption.adoptionId}`,
          tenantId,
          adoptionId: adoption.adoptionId,
          recommendationId: adoption.recommendationId,
          title: `Plano de adoção: ${adoption.title}`,
          objective: adoption.summary,
          steps: Object.freeze([
            Object.freeze({ order: 1, label: "Confirmar aceite da recomendação", requiresHuman: true }),
            Object.freeze({ order: 2, label: "Iniciar implementação", requiresHuman: true }),
            Object.freeze({ order: 3, label: "Registrar marcos de progresso", requiresHuman: true }),
            Object.freeze({ order: 4, label: "Validar impacto operacional", requiresHuman: true }),
          ]),
          status: adoption.status ?? ADOPTION_STATUS_TYPES.PROPOSED,
          requiresHumanApproval: true,
          autonomousExecutionForbidden: true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendAdoptionAuditEntry({
    tenantId,
    action: "adoption_plans_built",
    entityType: "plan",
  });

  return Object.freeze({ plans });
}

export default buildAdoptionPlans;
