import { upsertImprovementOpportunity } from "./improvementEngineStore.js";
import { appendImprovementAuditEntry } from "./improvementAuditTrail.js";

export function buildImprovementOpportunities(tenantId, ctx, signals) {
  const opportunities = [];

  for (const signal of signals.slice(0, 5)) {
    opportunities.push(
      upsertImprovementOpportunity(
        Object.freeze({
          opportunityId: `iopp-${tenantId}-${signal.signalId}`,
          tenantId,
          signalId: signal.signalId,
          title: `Oportunidade: ${signal.label}`,
          summary: signal.summary,
          expectedImpact: signal.strength === "high" ? "Impacto operacional significativo" : "Melhoria incremental",
          priority: signal.strength === "high" ? "high" : "medium",
          requiresHumanApproval: true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  if (ctx.pendingOutcomes?.length) {
    opportunities.push(
      upsertImprovementOpportunity(
        Object.freeze({
          opportunityId: `iopp-${tenantId}-validate-impact`,
          tenantId,
          title: "Validar impacto de melhorias adotadas",
          summary: "Confirmar efeito operacional das adoções concluídas.",
          expectedImpact: "Fecha o loop adoção → melhoria",
          priority: "high",
          requiresHumanApproval: true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendImprovementAuditEntry({ tenantId, action: "opportunities_built", entityType: "opportunity" });

  return Object.freeze({ opportunities });
}

export default buildImprovementOpportunities;
