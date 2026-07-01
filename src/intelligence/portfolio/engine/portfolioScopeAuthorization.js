import { resolveAuthorizedGroupScope } from "../../dna/engine/groupMaturityAggregation.js";
import { getAuthorizedGroupScope } from "../../dna/engine/businessDnaStore.js";

export function authorizePortfolioScope(groupId, tenantId = "default") {
  const scope = resolveAuthorizedGroupScope(groupId, tenantId);
  if (!scope) {
    return Object.freeze({
      authorized: false,
      groupId,
      tenantId,
      reason: "Escopo de grupo não autorizado — Portfolio Intelligence indisponível.",
      crossTenantMixingForbidden: true,
      unauthorizedAggregationForbidden: true,
    });
  }
  return Object.freeze({
    authorized: true,
    groupId,
    tenantId,
    ownerClientId: scope.ownerClientId ?? null,
    authorizedTenantIds: Object.freeze([...scope.authorizedTenantIds]),
    explainable: true,
  });
}

export function assertPortfolioScopeAuthorization(groupId, tenantId) {
  return authorizePortfolioScope(groupId, tenantId);
}

export default { authorizePortfolioScope, assertPortfolioScopeAuthorization };
