export function buildFortressSummary(groupId, ctx, complianceRules, retentionRules, auditEvents, complianceReview) {
  if (!ctx.authorized) {
    return Object.freeze({ authorized: false, headline: "Fortress requer escopo autorizado." });
  }

  const compliantStatus = complianceReview.reviews?.[0]?.status ?? "unknown";

  return Object.freeze({
    authorized: true,
    headline: `Fortress ativo — ${complianceRules.rules?.length ?? 0} regras compliance, ${retentionRules.rules?.length ?? 0} retenções, ${auditEvents.events?.length ?? 0} eventos auditados`,
    complianceRuleCount: complianceRules.rules?.length ?? 0,
    retentionRuleCount: retentionRules.rules?.length ?? 0,
    auditEventCount: auditEvents.events?.length ?? 0,
    complianceStatus: compliantStatus,
    tenantCount: ctx.authorizedTenantIds.length,
    explainable: true,
  });
}

export default buildFortressSummary;
