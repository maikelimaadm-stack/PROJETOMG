import { upsertGovernancePolicy } from "./platformGovernanceStore.js";
import { GOVERNANCE_POLICY_TYPES } from "./platformGovernanceContracts.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildTenantVisibilityRules(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorized: false, rules: [] });

  const rules = ctx.authorizedTenantIds.map((tid) => {
    const tenantCtx = ctx.tenantSummaries.find((t) => t.tenantId === tid);
    return upsertGovernancePolicy(
      Object.freeze({
        policyId: `gvis-${groupId}-${tid}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        policyType: GOVERNANCE_POLICY_TYPES.VISIBILITY,
        tenantId: tid,
        label: tenantCtx?.isCurrentTenant ? "Visibilidade — esta empresa" : `Visibilidade — empresa ${String(tid).slice(-4)}`,
        summary: "Visível apenas dentro do escopo de grupo autorizado.",
        visibleInGroup: true,
        visibleCrossTenant: false,
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    );
  });

  appendGovernanceAuditEntry({ groupId, action: "visibility_rules_built", entityType: "policy" });
  return Object.freeze({ authorized: true, rules: Object.freeze(rules), explainable: true });
}

export default buildTenantVisibilityRules;
