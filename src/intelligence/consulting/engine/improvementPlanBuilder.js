import { buildConsultingLineage } from "./consultingLineage.js";
import { createImprovementPlanRecord, upsertImprovementPlan } from "./consultingEngineStore.js";
import { appendConsultingAuditEntry } from "./consultingAuditTrail.js";
import { registerConsultingVersion } from "./consultingVersioning.js";

/** Build improvement plan — orientative, requires human approval */
export function buildImprovementPlan(input) {
  const plan = createImprovementPlanRecord({
    tenantId: input.tenantId,
    title: input.title ?? "Plano de melhoria operacional",
    objective: input.objective ?? input.summary ?? "",
    steps: input.steps ?? [
      Object.freeze({ order: 1, label: "Revisar contexto operacional", status: "pending" }),
      Object.freeze({ order: 2, label: "Validar recomendações com responsáveis", status: "pending" }),
      Object.freeze({ order: 3, label: "Aprovar plano de melhoria", status: "pending" }),
    ],
    recommendationIds: input.recommendationIds ?? [],
    expectedImpact: input.expectedImpact ?? "Evolução operacional mensurável após execução aprovada.",
    priority: input.priority ?? "medium",
  });
  registerConsultingVersion(plan.tenantId, plan.planId);
  upsertImprovementPlan(plan);
  appendConsultingAuditEntry({
    tenantId: plan.tenantId,
    action: "plan_created",
    entityId: plan.planId,
    entityType: "plan",
  });
  return plan;
}

export default buildImprovementPlan;
