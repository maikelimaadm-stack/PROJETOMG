export function buildGovernanceControlCenter(groupId, tenantId, ctx, summary, scopes, policies, compliance) {
  if (!ctx.authorized) {
    return Object.freeze({ authorized: false, title: "Control Center indisponível — escopo não autorizado." });
  }

  return Object.freeze({
    authorized: true,
    groupId,
    tenantId,
    title: "Governance Control Center",
    subtitle: "Administração segura de escopos, políticas e compliance",
    headline: summary.headline,
    scopeCount: scopes.scopes?.length ?? 0,
    policyCount: policies.policies?.length ?? 0,
    complianceStatus: compliance.compliances?.every((c) => c.status === "compliant") ? "compliant" : "review_required",
    compliantCount: compliance.compliances?.filter((c) => c.status === "compliant")?.length ?? 0,
    tenantCount: ctx.authorizedTenantIds.length,
    explainable: true,
    humanApprovalRequired: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildGovernanceControlCenter;
