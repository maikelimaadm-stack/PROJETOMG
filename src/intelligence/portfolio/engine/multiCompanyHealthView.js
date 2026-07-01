/**
 * Multi-Company Health View.
 * @see Program 3.22
 */

export function buildMultiCompanyHealthView(groupId, tenantId, health, comparison) {
  return Object.freeze({
    groupId,
    tenantId,
    title: "Saúde por empresa",
    groupHealthScore: health.healthScore ?? 0,
    companies: Object.freeze(
      (health.tenantHealthScores ?? []).map((c) =>
        Object.freeze({
          tenantId: c.tenantId,
          label: c.isCurrentTenant ? "Esta empresa" : `Empresa ${String(c.tenantId).slice(-4)}`,
          healthScore: c.healthScore,
          isCurrentTenant: c.isCurrentTenant,
        })
      )
    ),
    aboveStandard: Object.freeze(
      (comparison.aboveStandard ?? []).map((c) =>
        Object.freeze({ label: c.label, healthScore: c.healthScore, maturityScore: c.maturityScore })
      )
    ),
    belowStandard: Object.freeze(
      (comparison.belowStandard ?? []).map((c) =>
        Object.freeze({ label: c.label, healthScore: c.healthScore, atRisk: c.atRisk })
      )
    ),
    explainable: true,
    generatedAt: new Date().toISOString(),
  });
}

export default buildMultiCompanyHealthView;
