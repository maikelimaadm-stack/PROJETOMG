import { upsertPortfolioOpportunity } from "./portfolioIntelligenceStore.js";
import { appendPortfolioAuditEntry } from "./portfolioAuditTrail.js";

export function buildPortfolioOpportunityRegistry(groupId, ctx, comparison) {
  if (!ctx.authorized) return Object.freeze({ opportunities: [] });

  const opportunities = [];
  if (comparison.belowStandard?.length) {
    opportunities.push(
      upsertPortfolioOpportunity(
        Object.freeze({
          opportunityId: `popp-${groupId}-attention`,
          groupId,
          authorizedTenantIds: ctx.authorizedTenantIds,
          label: "Empresas que precisam de atenção",
          summary: `${comparison.belowStandard.length} empresa(s) abaixo do padrão do grupo.`,
          priority: "high",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }
  opportunities.push(
    upsertPortfolioOpportunity(
      Object.freeze({
        opportunityId: `popp-${groupId}-standardize`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Oportunidade de padronização corporativa",
        summary: "Práticas de referência podem ser replicadas entre empresas autorizadas.",
        priority: "medium",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendPortfolioAuditEntry({ groupId, action: "opportunities_built", entityType: "opportunity" });
  return Object.freeze({ opportunities });
}

export default buildPortfolioOpportunityRegistry;
