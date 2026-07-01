import { upsertPortfolioVariance } from "./portfolioIntelligenceStore.js";
import { appendPortfolioAuditEntry } from "./portfolioAuditTrail.js";

export function buildPortfolioVarianceRegistry(groupId, ctx, comparison) {
  if (!ctx.authorized) return Object.freeze({ variances: [] });

  const variances = (comparison.belowStandard ?? []).slice(0, 5).map((c) =>
    upsertPortfolioVariance(
      Object.freeze({
        varianceId: `pvar-${groupId}-${c.tenantId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        tenantId: c.tenantId,
        label: c.atRisk ? "Empresa em risco operacional" : "Desvio abaixo do padrão",
        deviationType: c.atRisk ? "at_risk" : "below_standard",
        summary: `${c.label} — saúde ${c.healthScore}%, maturidade ${c.maturityScore}.`,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendPortfolioAuditEntry({ groupId, action: "variances_built", entityType: "variance" });
  return Object.freeze({ variances });
}

export default buildPortfolioVarianceRegistry;
