import { resolveAuthorizedGroupScope } from "./groupMaturityAggregation.js";
import { aggregateGroupMaturity } from "./groupMaturityAggregation.js";
import { buildCorporateBenchmarking } from "./corporateBenchmarking.js";

/** Portfolio view — only when explicitly authorized */
export function buildPortfolioView(groupId, requestingTenantId) {
  const scope = resolveAuthorizedGroupScope(groupId, requestingTenantId);
  if (!scope) {
    return Object.freeze({
      hasPortfolio: false,
      authorized: false,
      message: "Visão de portfólio requer autorização explícita do grupo.",
      crossTenantMixingForbidden: true,
    });
  }

  const aggregation = aggregateGroupMaturity(groupId, requestingTenantId);
  const benchmarking = buildCorporateBenchmarking(groupId, requestingTenantId);

  return Object.freeze({
    hasPortfolio: true,
    authorized: true,
    groupId,
    tenantCount: scope.authorizedTenantIds.length,
    headline: `${scope.authorizedTenantIds.length} empresa(s) no portfólio autorizado.`,
    aggregation,
    benchmarking,
    aboveAverage: benchmarking.comparisons?.filter((c) => c.vsGroupAverage === "above") ?? [],
    belowAverage: benchmarking.comparisons?.filter((c) => c.vsGroupAverage === "below") ?? [],
    referenceCompanies: benchmarking.replicablePractices ?? [],
    attentionNeeded: benchmarking.deviations ?? [],
    explainable: true,
    crossTenantMixingForbidden: true,
  });
}

export default buildPortfolioView;
