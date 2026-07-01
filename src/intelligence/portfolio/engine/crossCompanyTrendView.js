/**
 * Cross-Company Trend View.
 * @see Program 3.22
 */

export function buildCrossCompanyTrendView(groupId, tenantId, evolution, maturity) {
  return Object.freeze({
    groupId,
    tenantId,
    title: "Tendências do grupo",
    trends: Object.freeze(
      (evolution.trends ?? []).map((t) =>
        Object.freeze({
          label: t.isCurrentTenant ? "Esta empresa" : `Empresa ${String(t.tenantId).slice(-4)}`,
          headline: t.evolutionHeadline,
          maturityLevel: t.maturityLevel,
          isCurrentTenant: t.isCurrentTenant,
        })
      )
    ),
    groupMaturityScore: maturity.averageMaturityScore ?? 0,
    explainable: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildCrossCompanyTrendView;
