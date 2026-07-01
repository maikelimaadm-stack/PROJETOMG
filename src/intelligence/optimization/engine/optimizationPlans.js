import { upsertOptimizationPlan, createOptimizationLoop, upsertOptimizationLoop } from "./optimizationEngineStore.js";
import { buildOptimizationLineage } from "./optimizationLineage.js";
import { registerOptimizationVersion } from "./optimizationVersioning.js";
import { appendOptimizationAuditEntry } from "./optimizationAuditTrail.js";

export function buildOptimizationPlans(tenantId, opportunities) {
  const loops = [];
  const plans = [];

  for (const opp of opportunities.slice(0, 5)) {
    const loop = createOptimizationLoop({
      tenantId,
      title: opp.title,
      summary: opp.summary,
      frictionScore: opp.priority === "high" ? 30 : 50,
      lineage: buildOptimizationLineage({ opportunityId: opp.opportunityId }),
    });
    upsertOptimizationLoop(loop);
    registerOptimizationVersion(tenantId, loop.loopId);
    loops.push(loop);

    plans.push(
      upsertOptimizationPlan(
        Object.freeze({
          planId: `oplan-${tenantId}-${opp.opportunityId}`,
          tenantId,
          loopId: loop.loopId,
          opportunityId: opp.opportunityId,
          title: `Plano: ${opp.title}`,
          objective: opp.summary,
          steps: Object.freeze([
            Object.freeze({ order: 1, label: "Revisar oportunidade de otimização", requiresHuman: true }),
            Object.freeze({ order: 2, label: "Aprovar loop de otimização", requiresHuman: true }),
            Object.freeze({ order: 3, label: "Aplicar melhoria com menor atrito", requiresHuman: true }),
          ]),
          requiresHumanApproval: true,
          autonomousExecutionForbidden: true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendOptimizationAuditEntry({ tenantId, action: "plans_built", entityType: "plan" });

  return Object.freeze({ loops, plans });
}

export default buildOptimizationPlans;
