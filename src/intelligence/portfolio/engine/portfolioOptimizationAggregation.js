export function aggregatePortfolioOptimization(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorized: false });

  const byTenant = ctx.tenantSummaries.map((t) =>
    Object.freeze({
      tenantId: t.tenantId,
      activeLoops: t.optimization?.activeLoopCount ?? 0,
      opportunities: t.optimization?.opportunityCount ?? 0,
    })
  );

  return Object.freeze({ authorized: true, byTenant: Object.freeze(byTenant), explainable: true });
}

export default aggregatePortfolioOptimization;
