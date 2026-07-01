export function aggregatePortfolioImprovement(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorized: false });

  const byTenant = ctx.tenantSummaries.map((t) =>
    Object.freeze({
      tenantId: t.tenantId,
      activeCycles: t.improvement?.activeCycleCount ?? 0,
      validatedImpact: t.improvement?.validatedImpactCount ?? 0,
    })
  );

  return Object.freeze({
    authorized: true,
    totalValidatedImpact: byTenant.reduce((s, t) => s + t.validatedImpact, 0),
    byTenant: Object.freeze(byTenant),
    explainable: true,
  });
}

export default aggregatePortfolioImprovement;
