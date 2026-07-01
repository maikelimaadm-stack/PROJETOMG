export function enforceDataExposureGuard(groupId, ctx, exposureType = "corporate_view") {
  if (!ctx.authorized) {
    return Object.freeze({
      exposureAllowed: false,
      reason: "Visão corporativa bloqueada — escopo não autorizado.",
      explainable: true,
    });
  }

  const rules = Object.freeze({
    corporate_view: ctx.authorizedTenantIds.length >= 1,
    aggregation: ctx.authorizedTenantIds.length >= 2,
    comparison: ctx.authorizedTenantIds.length >= 2,
    portfolio_command: ctx.authorizedTenantIds.length >= 1,
  });

  const allowed = rules[exposureType] ?? false;

  return Object.freeze({
    exposureAllowed: allowed,
    exposureType,
    authorizedTenantCount: ctx.authorizedTenantIds.length,
    because: allowed
      ? `Exposição ${exposureType} permitida para ${ctx.authorizedTenantIds.length} empresa(s) autorizadas.`
      : `Exposição ${exposureType} bloqueada — requisitos de escopo não atendidos.`,
    explainable: true,
    unauthorizedAggregationForbidden: true,
  });
}

export default enforceDataExposureGuard;
