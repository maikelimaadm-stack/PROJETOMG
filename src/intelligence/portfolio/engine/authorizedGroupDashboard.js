/**
 * Authorized Group Dashboard — executive portfolio dashboard.
 * @see Program 3.22
 */

export function buildAuthorizedGroupDashboard(groupId, tenantId, ctx, summary, health, ranking) {
  if (!ctx.authorized) {
    return Object.freeze({ authorized: false, title: "Dashboard indisponível — escopo não autorizado." });
  }

  return Object.freeze({
    authorized: true,
    groupId,
    tenantId,
    title: "Dashboard do grupo autorizado",
    headline: summary.headline,
    companyCount: summary.tenantCount ?? ctx.authorizedTenantIds.length,
    healthScore: health.healthScore ?? 0,
    atRiskCount: summary.atRiskCount ?? 0,
    aboveStandardCount: summary.aboveStandardCount ?? 0,
    belowStandardCount: summary.belowStandardCount ?? 0,
    topPerformers: Object.freeze(
      (ranking.rankings?.[0]?.entries ?? []).slice(0, 3).map((e) =>
        Object.freeze({ label: e.label, score: e.score, isCurrentTenant: e.isCurrentTenant })
      )
    ),
    needsAttention: Object.freeze(
      (ranking.rankings?.[0]?.entries ?? [])
        .slice()
        .reverse()
        .slice(0, 3)
        .map((e) => Object.freeze({ label: e.label, score: e.score, isCurrentTenant: e.isCurrentTenant }))
    ),
    explainable: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildAuthorizedGroupDashboard;
