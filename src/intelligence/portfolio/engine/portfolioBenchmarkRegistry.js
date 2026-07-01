import { upsertPortfolioBenchmark } from "./portfolioIntelligenceStore.js";
import { appendPortfolioAuditEntry } from "./portfolioAuditTrail.js";

export function buildPortfolioBenchmarkRegistry(groupId, ctx, healthAgg, maturityAgg) {
  if (!ctx.authorized) return Object.freeze({ benchmarks: [] });

  const benchmarks = [
    upsertPortfolioBenchmark(
      Object.freeze({
        benchmarkId: `pbench-${groupId}-maturity`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Referência de maturidade do grupo",
        metric: "maturity_score",
        referenceValue: maturityAgg.averageMaturityScore ?? 0,
        summary: "Maturidade média das empresas autorizadas.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertPortfolioBenchmark(
      Object.freeze({
        benchmarkId: `pbench-${groupId}-adoption`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Referência de adoção do grupo",
        metric: "adoption_progress",
        referenceValue: healthAgg.healthScore ?? 0,
        summary: "Baseline de saúde e adoção do portfólio.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendPortfolioAuditEntry({ groupId, action: "benchmarks_built", entityType: "benchmark" });
  return Object.freeze({ benchmarks });
}

export default buildPortfolioBenchmarkRegistry;
