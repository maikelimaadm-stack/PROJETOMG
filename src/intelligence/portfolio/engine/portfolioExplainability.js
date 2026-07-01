export function explainPortfolioView(view) {
  if (!view) return null;
  return Object.freeze({
    title: view.title,
    because: "Visão consolidada apenas de empresas autorizadas do mesmo cliente — sem mistura de tenants.",
    authorizedTenantCount: view.authorizedTenantIds?.length ?? 0,
    explainable: true,
    crossTenantMixingForbidden: true,
  });
}

export function explainPortfolioComparison(comparison) {
  if (!comparison) return null;
  return Object.freeze({
    label: comparison.label,
    because: `Saúde ${comparison.healthScore}% vs. padrão do grupo (${comparison.vsGroupHealth}).`,
    atRisk: comparison.atRisk ?? false,
    explainable: true,
  });
}

export default { explainPortfolioView, explainPortfolioComparison };
