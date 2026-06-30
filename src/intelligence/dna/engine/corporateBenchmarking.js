import { resolveAuthorizedGroupScope } from "./groupMaturityAggregation.js";
import { assembleBusinessDnaContext } from "./businessDnaContextAssembly.js";
import { computeDnaCapabilityMaturity } from "./businessDnaMaturityModel.js";

/** Cross-company comparison — authorized tenants only */
export function buildCrossCompanyComparison(groupId, requestingTenantId) {
  const scope = resolveAuthorizedGroupScope(groupId, requestingTenantId);
  if (!scope) {
    return Object.freeze({
      authorized: false,
      comparisons: [],
      crossTenantMixingForbidden: true,
    });
  }

  const entries = scope.authorizedTenantIds.map((tenantId) => {
    const ctx = assembleBusinessDnaContext(tenantId);
    const maturity = computeDnaCapabilityMaturity(ctx);
    const avgScore = maturity.capabilities.reduce((s, c) => s + c.score, 0) / maturity.capabilities.length;
    return Object.freeze({
      tenantId,
      label: `Empresa ${tenantId}`,
      overallLevel: maturity.overallLevel,
      avgScore,
    });
  });

  entries.sort((a, b) => b.avgScore - a.avgScore);
  const groupAvg = entries.reduce((s, e) => s + e.avgScore, 0) / (entries.length || 1);

  const comparisons = entries.map((e) =>
    Object.freeze({
      ...e,
      vsGroupAverage: e.avgScore >= groupAvg ? "above" : e.avgScore < groupAvg ? "below" : "at",
      isReference: e.avgScore === entries[0]?.avgScore && entries.length > 1,
      needsAttention: e.avgScore < groupAvg * 0.8,
    })
  );

  return Object.freeze({
    authorized: true,
    groupId,
    groupAverage: Math.round(groupAvg * 10) / 10,
    comparisons: Object.freeze(comparisons),
    referenceTenant: entries[0]?.tenantId ?? null,
    explainable: true,
    crossTenantMixingForbidden: true,
  });
}

/** Corporate benchmarking within authorized group */
export function buildCorporateBenchmarking(groupId, requestingTenantId) {
  const comparison = buildCrossCompanyComparison(groupId, requestingTenantId);
  if (!comparison.authorized) return comparison;

  return Object.freeze({
    ...comparison,
    benchmarkType: "internal_group",
    replicablePractices: Object.freeze(
      comparison.comparisons
        .filter((c) => c.isReference)
        .map((c) =>
          Object.freeze({
            tenantId: c.tenantId,
            label: "Referência em maturidade operacional",
            because: "Empresa com maior maturidade média no grupo autorizado.",
          })
        )
    ),
    deviations: Object.freeze(
      comparison.comparisons
        .filter((c) => c.needsAttention)
        .map((c) =>
          Object.freeze({
            tenantId: c.tenantId,
            label: "Abaixo do padrão corporativo",
            because: "Maturidade significativamente abaixo da média do grupo.",
          })
        )
    ),
  });
}

export default { buildCrossCompanyComparison, buildCorporateBenchmarking };
