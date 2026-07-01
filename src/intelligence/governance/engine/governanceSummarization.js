import { retrieveGovernanceByContext } from "./governanceRetrieval.js";
import { GOVERNANCE_OWNERSHIP } from "./platformGovernanceContracts.js";

export function summarizePlatformGovernanceEngine(groupId) {
  const retrieved = retrieveGovernanceByContext(groupId);
  const headline =
    retrieved.documents.length > 0
      ? `Governança: ${retrieved.scopes.length} escopos, ${retrieved.policies.length} políticas, ${retrieved.compliances.length} regras de compliance`
      : "Governança será consolidada quando escopo de grupo estiver autorizado.";

  return Object.freeze({
    groupId,
    summarizedAt: new Date().toISOString(),
    documentCount: retrieved.documents.length,
    scopeCount: retrieved.scopes.length,
    policyCount: retrieved.policies.length,
    permissionCount: retrieved.permissions.length,
    retentionCount: retrieved.retentions.length,
    auditCount: retrieved.audits.length,
    complianceCount: retrieved.compliances.length,
    headline,
    explainable: true,
    belongsToPlatform: true,
    policyChangeRequiresAudit: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    ...GOVERNANCE_OWNERSHIP,
  });
}

export default summarizePlatformGovernanceEngine;
