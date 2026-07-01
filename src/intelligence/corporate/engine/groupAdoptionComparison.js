import { retrieveAdoptionsByContext } from "../../adoption/engine/adoptionRetrieval.js";
import { resolveAuthorizedGroupScope } from "../../dna/engine/groupMaturityAggregation.js";

export function buildGroupAdoptionComparison(groupId, tenantId = "default") {
  const scope = resolveAuthorizedGroupScope(groupId, tenantId);
  if (!scope?.authorizedTenantIds?.length) {
    return Object.freeze({
      groupId,
      authorized: false,
      comparisons: [],
      reason: "Comparação requer escopo de grupo autorizado.",
    });
  }

  const comparisons = scope.authorizedTenantIds.map((tid) => {
    const data = retrieveAdoptionsByContext(tid);
    return Object.freeze({
      tenantId: tid,
      isCurrentTenant: tid === tenantId,
      adoptionCount: data.adoptions.length,
      progressPercent: data.progress.overallProgressPercent,
      acceptedCount: data.statusBreakdown.acceptedCount,
      inProgressCount: data.statusBreakdown.inProgressCount,
      label: tid === tenantId ? "Esta empresa" : `Empresa ${tid.slice(-4)}`,
    });
  });

  const sorted = [...comparisons].sort((a, b) => b.progressPercent - a.progressPercent);
  const leader = sorted[0];
  const laggard = sorted[sorted.length - 1];

  return Object.freeze({
    groupId,
    tenantId,
    authorized: true,
    comparisons: Object.freeze(comparisons),
    leader: leader ?? null,
    belowStandard: laggard?.progressPercent < 50 ? laggard : null,
    explainable: true,
    crossTenantMixingForbidden: true,
  });
}

export default buildGroupAdoptionComparison;
