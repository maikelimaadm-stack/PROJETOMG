import { upsertImprovementPlan, createImprovementLoop, upsertImprovementLoop } from "./improvementEngineStore.js";
import { buildImprovementLineage } from "./improvementLineage.js";
import { registerImprovementVersion } from "./improvementVersioning.js";
import { appendImprovementAuditEntry } from "./improvementAuditTrail.js";

export function buildImprovementPlans(tenantId, opportunities) {
  const loops = [];
  const plans = [];

  for (const opp of opportunities.slice(0, 5)) {
    const loop = createImprovementLoop({
      tenantId,
      title: opp.title,
      summary: opp.summary,
      impactScore: opp.priority === "high" ? 75 : 50,
      lineage: buildImprovementLineage({ opportunityId: opp.opportunityId }),
    });
    upsertImprovementLoop(loop);
    registerImprovementVersion(tenantId, loop.loopId);
    loops.push(loop);

    plans.push(
      upsertImprovementPlan(
        Object.freeze({
          planId: `iplan-${tenantId}-${opp.opportunityId}`,
          tenantId,
          loopId: loop.loopId,
          opportunityId: opp.opportunityId,
          title: `Plano: ${opp.title}`,
          objective: opp.summary,
          steps: Object.freeze([
            Object.freeze({ order: 1, label: "Revisar oportunidade de melhoria", requiresHuman: true }),
            Object.freeze({ order: 2, label: "Aprovar ciclo de melhoria", requiresHuman: true }),
            Object.freeze({ order: 3, label: "Executar e medir impacto", requiresHuman: true }),
            Object.freeze({ order: 4, label: "Validar efeito operacional", requiresHuman: true }),
          ]),
          requiresHumanApproval: true,
          autonomousExecutionForbidden: true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendImprovementAuditEntry({ tenantId, action: "plans_built", entityType: "plan" });

  return Object.freeze({ loops, plans });
}

export default buildImprovementPlans;
