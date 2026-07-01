import { upsertGovernanceAudit } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildAuditPolicyEngine(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ auditPolicies: [] });

  const auditPolicy = upsertGovernanceAudit(
    Object.freeze({
      auditId: `gaudit-policy-${groupId}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Política de auditoria ativa",
      summary: "Toda mudança de escopo, permissão ou política gera trilha de auditoria.",
      auditRequired: true,
      reviewRequired: true,
      lifecycleState: "active",
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendGovernanceAuditEntry({ groupId, action: "audit_policy_registered", entityId: auditPolicy.auditId, entityType: "audit_policy" });
  return Object.freeze({ auditPolicies: Object.freeze([auditPolicy]), explainable: true });
}

export default buildAuditPolicyEngine;
