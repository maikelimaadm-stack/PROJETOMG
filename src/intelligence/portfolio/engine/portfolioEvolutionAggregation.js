export function aggregatePortfolioEvolution(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorized: false, trends: [] });

  const trends = ctx.tenantSummaries.map((t) =>
    Object.freeze({
      tenantId: t.tenantId,
      isCurrentTenant: t.isCurrentTenant,
      evolutionHeadline: t.evolution?.headline ?? "Evolução operacional em acompanhamento",
      maturityLevel: t.evolution?.maturityLevel ?? t.dna?.maturityLevel ?? "emerging",
    })
  );

  return Object.freeze({ authorized: true, trends: Object.freeze(trends), explainable: true });
}

export default aggregatePortfolioEvolution;
