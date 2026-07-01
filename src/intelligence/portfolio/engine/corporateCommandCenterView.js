/**
 * Corporate Command Center View — primary executive command surface.
 * @see Program 3.22
 */

export function buildCorporateCommandCenterView(
  groupId,
  tenantId,
  ctx,
  summary,
  health,
  maturity,
  evolution,
  comparison,
  ranking
) {
  if (!ctx.authorized) {
    return Object.freeze({ authorized: false, title: "Command Center indisponível." });
  }

  return Object.freeze({
    authorized: true,
    groupId,
    tenantId,
    title: "Command Center Corporativo",
    subtitle: "Visão executiva autorizada do grupo",
    headline: summary.headline,
    healthOverview: Object.freeze({
      score: health.healthScore ?? 0,
      atRisk: summary.atRiskCount ?? 0,
      aboveStandard: comparison.aboveStandard?.length ?? 0,
      belowStandard: comparison.belowStandard?.length ?? 0,
    }),
    maturityOverview: Object.freeze({
      score: maturity.averageMaturityScore ?? 0,
      tenantCount: ctx.authorizedTenantIds.length,
    }),
    evolutionOverview: Object.freeze({
      trendCount: evolution.trends?.length ?? 0,
      emerging: evolution.trends?.filter((t) => t.maturityLevel === "emerging")?.length ?? 0,
    }),
    rankings: Object.freeze({
      leader: ranking.leader ?? null,
      laggard: ranking.laggard ?? null,
      entries: ranking.rankings?.[0]?.entries?.slice(0, 5) ?? [],
    }),
    explainable: true,
    humanApprovalRequired: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildCorporateCommandCenterView;
