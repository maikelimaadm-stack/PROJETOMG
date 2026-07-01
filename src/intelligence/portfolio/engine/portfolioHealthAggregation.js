import { upsertPortfolioBenchmark } from "./portfolioIntelligenceStore.js";
import { appendPortfolioAuditEntry } from "./portfolioAuditTrail.js";

export function aggregatePortfolioHealth(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorized: false, healthScore: null });

  const scores = ctx.tenantSummaries.map((t) => {
    const adoption = t.adoption?.overallProgressPercent ?? 0;
    const dna = t.dna?.maturityScore ?? 50;
    return Math.round((adoption + dna) / 2);
  });
  const healthScore = scores.length ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;

  upsertPortfolioBenchmark(
    Object.freeze({
      benchmarkId: `pbench-${groupId}-health`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Saúde consolidada do portfólio",
      metric: "portfolio_health",
      referenceValue: healthScore,
      summary: `Saúde média de ${ctx.authorizedTenantIds.length} empresas autorizadas.`,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendPortfolioAuditEntry({ groupId, action: "health_aggregated", entityType: "health" });

  return Object.freeze({
    authorized: true,
    healthScore,
    tenantHealthScores: Object.freeze(
      ctx.tenantSummaries.map((t, i) =>
        Object.freeze({ tenantId: t.tenantId, healthScore: scores[i], isCurrentTenant: t.isCurrentTenant })
      )
    ),
    explainable: true,
  });
}

export default aggregatePortfolioHealth;
