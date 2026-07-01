export function buildPortfolioControlCenter(groupId, tenantId, ctx, exposureGuard, permissionRegistry) {
  if (!ctx.authorized) {
    return Object.freeze({ authorized: false, title: "Portfolio Control Center indisponível." });
  }

  const grantedPermissions = permissionRegistry.permissions?.filter((p) => p.granted) ?? [];

  return Object.freeze({
    authorized: true,
    groupId,
    tenantId,
    title: "Portfolio Control Center",
    subtitle: "Controles de visibilidade e agregação do portfólio autorizado",
    portfolioViewAllowed: exposureGuard.exposureAllowed === true,
    aggregationAllowed: ctx.authorizedTenantIds.length >= 2,
    comparisonAllowed: ctx.authorizedTenantIds.length >= 2,
    activePermissions: Object.freeze(grantedPermissions.map((p) => Object.freeze({ label: p.label, granted: p.granted }))),
    exposureBecause: exposureGuard.because ?? "",
    explainable: true,
    humanApprovalRequired: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildPortfolioControlCenter;
