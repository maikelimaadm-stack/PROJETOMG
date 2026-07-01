import { resolveAuthorizedGroupScope } from "../../dna/engine/groupMaturityAggregation.js";
import { summarizePlatformGovernanceEngine } from "../../governance/engine/governanceSummarization.js";
import { summarizePortfolioIntelligenceEngine } from "../../portfolio/engine/portfolioSummarization.js";
import { summarizeEnterpriseMemory } from "../../memory/engine/memorySummarization.js";
import { listGovernanceRetentions, listGovernanceCompliances } from "../../governance/engine/platformGovernanceStore.js";

export function assembleComplianceContext(groupId, tenantId = "default", options = {}) {
  const scope = resolveAuthorizedGroupScope(groupId, tenantId);
  if (!scope) {
    return Object.freeze({
      authorized: false,
      groupId,
      tenantId,
      reason: "Escopo não autorizado — compliance indisponível.",
      crossTenantMixingForbidden: true,
      assembledAt: new Date().toISOString(),
    });
  }

  const tenantSummaries = scope.authorizedTenantIds.map((tid) =>
    Object.freeze({
      tenantId: tid,
      isCurrentTenant: tid === tenantId,
      memory: summarizeEnterpriseMemory(tid),
    })
  );

  return Object.freeze({
    authorized: true,
    groupId,
    tenantId,
    ownerClientId: scope.ownerClientId ?? null,
    authorizedTenantIds: Object.freeze([...scope.authorizedTenantIds]),
    tenantSummaries: Object.freeze(tenantSummaries),
    governanceSummary: summarizePlatformGovernanceEngine(groupId),
    portfolioSummary: summarizePortfolioIntelligenceEngine(groupId),
    governanceRetentions: listGovernanceRetentions(groupId),
    governanceCompliances: listGovernanceCompliances(groupId),
    explainable: true,
    assembledAt: new Date().toISOString(),
  });
}

export default assembleComplianceContext;
