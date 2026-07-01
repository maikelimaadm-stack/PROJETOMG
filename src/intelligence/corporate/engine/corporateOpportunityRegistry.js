import { upsertCorporateOpportunity } from "./corporateIntelligenceStore.js";
import { appendCorporateAuditEntry } from "./corporateIntelligenceAuditTrail.js";

export function buildCorporateOpportunityRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ opportunities: [] });

  const pendingCount = ctx.adoptionSummary?.pendingCount ?? 0;
  const opportunities = [];

  if (pendingCount > 0) {
    opportunities.push(
      upsertCorporateOpportunity(
        Object.freeze({
          opportunityId: `copp-${groupId}-pending`,
          groupId,
          authorizedTenantIds: ctx.authorizedTenantIds,
          label: "Oportunidade de acelerar adoção",
          summary: `${pendingCount} recomendações aguardam decisão de adoção no grupo autorizado.`,
          priority: "medium",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  opportunities.push(
    upsertCorporateOpportunity(
      Object.freeze({
        opportunityId: `copp-${groupId}-replication`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Oportunidade de replicação assistida",
        summary: "Práticas bem-sucedidas podem ser replicadas entre empresas autorizadas.",
        priority: "high",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendCorporateAuditEntry({ groupId, action: "opportunities_built", entityType: "opportunity" });

  return Object.freeze({ opportunities });
}

export default buildCorporateOpportunityRegistry;
