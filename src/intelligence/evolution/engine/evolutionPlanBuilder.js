import { createEvolutionPlan, upsertEvolutionPlan } from "./evolutionEngineStore.js";
import { appendEvolutionAuditEntry } from "./evolutionAuditTrail.js";
import { registerEvolutionVersion } from "./evolutionVersioning.js";

export function buildEvolutionPlan(input) {
  const plan = createEvolutionPlan({
    tenantId: input.tenantId,
    title: input.title ?? "Plano de evolução organizacional",
    objective: input.objective ?? input.summary ?? "",
    steps: input.steps ?? [
      Object.freeze({ order: 1, label: "Consolidar memória operacional", status: "pending" }),
      Object.freeze({ order: 2, label: "Amadurecer capacidades prioritárias", status: "pending" }),
      Object.freeze({ order: 3, label: "Acompanhar marcos de evolução", status: "pending" }),
    ],
    expectedImpact: input.expectedImpact ?? "Evolução contínua mensurável da operação.",
    confidence: input.confidence ?? "medium",
  });
  registerEvolutionVersion(input.tenantId, plan.planId);
  upsertEvolutionPlan(plan);
  appendEvolutionAuditEntry({
    tenantId: plan.tenantId,
    action: "plan_created",
    entityId: plan.planId,
    entityType: "plan",
  });
  return plan;
}

export default buildEvolutionPlan;
