export function aggregatePortfolioRecommendations(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorized: false, total: 0 });

  const byTenant = ctx.tenantSummaries.map((t) =>
    Object.freeze({
      tenantId: t.tenantId,
      count: t.recommendation?.recommendationCount ?? 0,
      highPriority: t.recommendation?.highPriorityCount ?? 0,
    })
  );
  const total = byTenant.reduce((s, t) => s + t.count, 0);

  return Object.freeze({ authorized: true, total, byTenant: Object.freeze(byTenant), explainable: true });
}

export default aggregatePortfolioRecommendations;
