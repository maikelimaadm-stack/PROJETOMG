import { upsertGovernancePolicy } from "./platformGovernanceStore.js";
import { GOVERNANCE_POLICY_TYPES } from "./platformGovernanceContracts.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildPolicyRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ policies: [] });

  const policies = [
    upsertGovernancePolicy(
      Object.freeze({
        policyId: `gpolicy-${groupId}-aggregation`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        policyType: GOVERNANCE_POLICY_TYPES.AGGREGATION,
        label: "Política de agregação corporativa",
        summary: "Agregação permitida somente entre empresas do escopo autorizado.",
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertGovernancePolicy(
      Object.freeze({
        policyId: `gpolicy-${groupId}-exposure`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        policyType: GOVERNANCE_POLICY_TYPES.VISIBILITY,
        label: "Política de exposição de inteligência",
        summary: "Inteligência corporativa visível apenas com autorização explícita.",
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendGovernanceAuditEntry({ groupId, action: "policies_registered", entityType: "policy" });
  return Object.freeze({ policies: Object.freeze(policies), explainable: true });
}

export default buildPolicyRegistry;
