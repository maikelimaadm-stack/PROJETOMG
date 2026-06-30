import {
  getAuthorizedGroupScope,
  isTenantAuthorizedInGroup,
  listDnaProfiles,
  listDnaMaturityRecords,
} from "./businessDnaStore.js";
import { assembleBusinessDnaContext } from "./businessDnaContextAssembly.js";
import { computeDnaCapabilityMaturity } from "./businessDnaMaturityModel.js";

/** Authorized portfolio scope — never mix without permission */
export function resolveAuthorizedGroupScope(groupId, requestingTenantId) {
  const scope = getAuthorizedGroupScope(groupId);
  if (!scope) return null;
  if (!scope.authorizedTenantIds.includes(requestingTenantId)) return null;
  return scope;
}

export function aggregateGroupMaturity(groupId, requestingTenantId) {
  const scope = resolveAuthorizedGroupScope(groupId, requestingTenantId);
  if (!scope) {
    return Object.freeze({
      authorized: false,
      groupId,
      reason: "Escopo de grupo não autorizado ou tenant não incluído.",
      crossTenantMixingForbidden: true,
    });
  }

  const tenantSummaries = [];
  for (const tenantId of scope.authorizedTenantIds) {
    const ctx = assembleBusinessDnaContext(tenantId);
    const maturity = computeDnaCapabilityMaturity(ctx);
    tenantSummaries.push(
      Object.freeze({
        tenantId,
        overallLevel: maturity.overallLevel,
        capabilityCount: maturity.capabilities.length,
        avgScore: maturity.capabilities.reduce((s, c) => s + c.score, 0) / maturity.capabilities.length,
      })
    );
  }

  const avgMaturity =
    tenantSummaries.reduce((s, t) => s + t.avgScore, 0) / (tenantSummaries.length || 1);

  return Object.freeze({
    authorized: true,
    groupId,
    tenantCount: tenantSummaries.length,
    averageMaturityScore: Math.round(avgMaturity * 10) / 10,
    tenants: Object.freeze(tenantSummaries),
    crossTenantMixingForbidden: true,
    explainable: true,
  });
}

export default { resolveAuthorizedGroupScope, aggregateGroupMaturity };
