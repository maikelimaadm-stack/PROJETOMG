import { aggregateGroupMaturity } from "../../dna/engine/groupMaturityAggregation.js";

export function aggregatePortfolioMaturity(groupId, tenantId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorized: false });
  const aggregation = aggregateGroupMaturity(groupId, tenantId);
  return Object.freeze({
    authorized: true,
    averageMaturityScore: aggregation.averageMaturityScore ?? 0,
    tenants: aggregation.tenants ?? [],
    explainable: true,
  });
}

export default aggregatePortfolioMaturity;
