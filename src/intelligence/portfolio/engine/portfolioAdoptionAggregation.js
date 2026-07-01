export function aggregatePortfolioAdoption(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorized: false });

  const byTenant = ctx.tenantSummaries.map((t) =>
    Object.freeze({
      tenantId: t.tenantId,
      isCurrentTenant: t.isCurrentTenant,
      progressPercent: t.adoption?.overallProgressPercent ?? 0,
      acceptedCount: t.adoption?.acceptedCount ?? 0,
      inProgressCount: t.adoption?.inProgressCount ?? 0,
    })
  );
  const avgProgress = byTenant.length
    ? Math.round(byTenant.reduce((s, t) => s + t.progressPercent, 0) / byTenant.length)
    : 0;

  return Object.freeze({ authorized: true, averageProgressPercent: avgProgress, byTenant: Object.freeze(byTenant), explainable: true });
}

export default aggregatePortfolioAdoption;
