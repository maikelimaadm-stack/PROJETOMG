import { resolveAuthorizedGroupScope } from "../../dna/engine/groupMaturityAggregation.js";
import { summarizePlatformGovernanceEngine } from "../../governance/engine/governanceSummarization.js";
import { summarizeFortressEngine } from "../../fortress/engine/fortressSummarization.js";
import { summarizeEnterpriseMemory } from "../../memory/engine/memorySummarization.js";
import { retrieveLatestFortress } from "../../fortress/engine/fortressRetrieval.js";

export function assembleLifecycleContext(groupId, tenantId = "default", options = {}) {
  const scope = resolveAuthorizedGroupScope(groupId, tenantId);
  if (!scope) {
    return Object.freeze({
      authorized: false,
      groupId,
      tenantId,
      reason: "Escopo não autorizado — ciclo de vida indisponível.",
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

  const fortress = retrieveLatestFortress(groupId);

  return Object.freeze({
    authorized: true,
    groupId,
    tenantId,
    ownerClientId: scope.ownerClientId ?? null,
    authorizedTenantIds: Object.freeze([...scope.authorizedTenantIds]),
    tenantSummaries: Object.freeze(tenantSummaries),
    governanceSummary: summarizePlatformGovernanceEngine(groupId),
    fortressSummary: summarizeFortressEngine(groupId),
    fortressRetentions: fortress.retentionRules ?? [],
    fortressArchives: fortress.archives ?? [],
    fortressHolds: fortress.holds ?? [],
    fortressExpunges: fortress.expunges ?? [],
    fortressAuditEvents: fortress.auditEvents ?? [],
    explainable: true,
    assembledAt: new Date().toISOString(),
  });
}

export default assembleLifecycleContext;
