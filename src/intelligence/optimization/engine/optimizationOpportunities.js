import { upsertOptimizationOpportunity } from "./optimizationEngineStore.js";
import { appendOptimizationAuditEntry } from "./optimizationAuditTrail.js";

export function buildOptimizationOpportunities(tenantId, ctx, signals) {
  const opportunities = [];

  for (const signal of signals.slice(0, 5)) {
    opportunities.push(
      upsertOptimizationOpportunity(
        Object.freeze({
          opportunityId: `oopp-${tenantId}-${signal.signalId}`,
          tenantId,
          signalId: signal.signalId,
          title: `Otimização: ${signal.label}`,
          summary: signal.summary,
          expectedFrictionReduction: signal.strength === "high" ? "Alto" : "Médio",
          priority: signal.strength === "high" ? "high" : "medium",
          requiresHumanApproval: true,
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendOptimizationAuditEntry({ tenantId, action: "opportunities_built", entityType: "opportunity" });

  return Object.freeze({ opportunities });
}

export default buildOptimizationOpportunities;
