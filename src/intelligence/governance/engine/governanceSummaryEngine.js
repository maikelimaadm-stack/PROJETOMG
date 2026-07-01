export function buildGovernanceSummary(groupId, ctx, scopes, policies, compliance, permissions) {
  if (!ctx.authorized) {
    return Object.freeze({ authorized: false, headline: "Governança requer autorização de grupo." });
  }

  const compliantCount = compliance.compliances?.filter((c) => c.status === "compliant")?.length ?? 0;
  const grantedCount = permissions.permissions?.filter((p) => p.granted)?.length ?? 0;

  return Object.freeze({
    authorized: true,
    headline: `Governança ativa — ${scopes.scopes?.length ?? 0} escopo(s), ${policies.policies?.length ?? 0} política(s), ${compliantCount} regra(s) em compliance, ${grantedCount} permissão(ões) ativa(s)`,
    scopeCount: scopes.scopes?.length ?? 0,
    policyCount: policies.policies?.length ?? 0,
    compliantCount,
    grantedPermissionCount: grantedCount,
    tenantCount: ctx.authorizedTenantIds.length,
    explainable: true,
  });
}

export default buildGovernanceSummary;
