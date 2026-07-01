export function buildPortfolioSummary(groupId, ctx, healthAgg, comparison, ranking) {
  if (!ctx.authorized) {
    return Object.freeze({ authorized: false, headline: "Portfólio requer autorização de grupo." });
  }

  const tenantCount = ctx.authorizedTenantIds.length;
  const atRiskCount = comparison.belowStandard?.filter((c) => c.atRisk)?.length ?? 0;
  const leader = ranking.leader?.label ?? "—";

  return Object.freeze({
    authorized: true,
    headline: `${tenantCount} empresas autorizadas — saúde ${healthAgg.healthScore}% — líder: ${leader}`,
    tenantCount,
    healthScore: healthAgg.healthScore,
    atRiskCount,
    aboveStandardCount: comparison.aboveStandard?.length ?? 0,
    belowStandardCount: comparison.belowStandard?.length ?? 0,
    explainable: true,
  });
}

export default buildPortfolioSummary;
