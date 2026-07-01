export function buildPortfolioComparison(groupId, ctx, healthAgg, maturityAgg) {
  if (!ctx.authorized) return Object.freeze({ authorized: false, comparisons: [] });

  const avgHealth = healthAgg.healthScore ?? 50;
  const avgMaturity = maturityAgg.averageMaturityScore ?? 50;

  const comparisons = ctx.tenantSummaries.map((t) => {
    const health = healthAgg.tenantHealthScores?.find((h) => h.tenantId === t.tenantId)?.healthScore ?? 50;
    const maturity = maturityAgg.tenants?.find((m) => m.tenantId === t.tenantId)?.avgScore ?? 50;
    const vsHealth = health >= avgHealth ? "above" : health < avgHealth - 10 ? "below" : "average";
    const vsMaturity = maturity >= avgMaturity ? "above" : maturity < avgMaturity - 5 ? "below" : "average";
    return Object.freeze({
      tenantId: t.tenantId,
      isCurrentTenant: t.isCurrentTenant,
      label: t.isCurrentTenant ? "Esta empresa" : `Empresa ${String(t.tenantId).slice(-4)}`,
      healthScore: health,
      maturityScore: Math.round(maturity * 10) / 10,
      vsGroupHealth: vsHealth,
      vsGroupMaturity: vsMaturity,
      atRisk: vsHealth === "below" && vsMaturity === "below",
    });
  });

  return Object.freeze({
    authorized: true,
    comparisons: Object.freeze(comparisons),
    aboveStandard: comparisons.filter((c) => c.vsGroupHealth === "above" && c.vsGroupMaturity !== "below"),
    belowStandard: comparisons.filter((c) => c.vsGroupHealth === "below" || c.atRisk),
    explainable: true,
    crossTenantMixingForbidden: true,
  });
}

export default buildPortfolioComparison;
