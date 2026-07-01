export function explainCorporateIntelligence(view) {
  if (!view) return null;
  return Object.freeze({
    viewId: view.viewId,
    title: view.title,
    because: "Visão consolidada apenas de empresas autorizadas do mesmo cliente — sem mistura de tenants.",
    authorizedTenantCount: view.authorizedTenantIds?.length ?? 0,
    explainable: true,
    crossTenantMixingForbidden: true,
  });
}

export function explainCorporateVariance(variance) {
  if (!variance) return null;
  return Object.freeze({
    varianceId: variance.varianceId,
    label: variance.label,
    because: variance.summary,
    deviationType: variance.deviationType,
    explainable: true,
  });
}

export default { explainCorporateIntelligence, explainCorporateVariance };
