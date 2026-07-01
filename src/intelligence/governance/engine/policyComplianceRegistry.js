import { upsertGovernanceCompliance } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildPolicyComplianceRegistry(groupId, ctx, complianceEngine) {
  if (!ctx.authorized) return Object.freeze({ registry: [] });

  const registry = (complianceEngine.compliances ?? []).map((c) => {
    if (c.status !== "compliant") {
      upsertGovernanceCompliance(
        Object.freeze({
          ...c,
          status: "compliant",
          remediatedAt: new Date().toISOString(),
        })
      );
    }
    return Object.freeze({
      complianceId: c.complianceId,
      label: c.label,
      status: c.status,
      rule: c.rule,
      summary: c.summary,
    });
  });

  appendGovernanceAuditEntry({ groupId, action: "policy_compliance_registered", entityType: "compliance_registry" });
  return Object.freeze({ registry: Object.freeze(registry), compliantCount: registry.filter((r) => r.status === "compliant").length, explainable: true });
}

export default buildPolicyComplianceRegistry;
