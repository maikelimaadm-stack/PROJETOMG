import { resolveAuthorizedGroupScope } from "../../dna/engine/groupMaturityAggregation.js";
import { summarizePortfolioIntelligenceEngine } from "../../portfolio/engine/portfolioSummarization.js";
import { summarizeCorporateIntelligenceEngine } from "../../corporate/engine/corporateIntelligenceSummarization.js";
import { summarizeAdoptionEngine } from "../../adoption/engine/adoptionSummarization.js";
import { summarizeBusinessDnaEngine } from "../../dna/engine/businessDnaSummarization.js";
import { summarizeEnterpriseMemory } from "../../memory/engine/memorySummarization.js";
import { listAuthorizedGroupScopes } from "../../dna/engine/businessDnaStore.js";

export function assembleGovernanceContext(groupId, tenantId = "default", options = {}) {
  const scope = resolveAuthorizedGroupScope(groupId, tenantId);
  if (!scope) {
    return Object.freeze({
      authorized: false,
      groupId,
      tenantId,
      reason: "Escopo de grupo não autorizado — governança indisponível.",
      crossTenantMixingForbidden: true,
      assembledAt: new Date().toISOString(),
    });
  }

  const tenantSummaries = scope.authorizedTenantIds.map((tid) =>
    Object.freeze({
      tenantId: tid,
      isCurrentTenant: tid === tenantId,
      memory: summarizeEnterpriseMemory(tid),
      dna: summarizeBusinessDnaEngine(tid),
      adoption: summarizeAdoptionEngine(tid),
    })
  );

  const allScopes = listAuthorizedGroupScopes();

  return Object.freeze({
    authorized: true,
    groupId,
    tenantId,
    ownerClientId: scope.ownerClientId ?? null,
    authorizedTenantIds: Object.freeze([...scope.authorizedTenantIds]),
    tenantSummaries: Object.freeze(tenantSummaries),
    portfolioSummary: summarizePortfolioIntelligenceEngine(groupId),
    corporateSummary: summarizeCorporateIntelligenceEngine(groupId),
    registeredGroupCount: Object.keys(allScopes).length,
    explainable: true,
    belongsToPlatform: true,
    crossTenantMixingForbidden: true,
    assembledAt: new Date().toISOString(),
  });
}

export default assembleGovernanceContext;
