import { upsertGovernanceRetention } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildRetentionEnforcementRegistry(groupId, ctx, retentionEngine) {
  if (!ctx.authorized) return Object.freeze({ enforcements: [] });

  const enforcements = (retentionEngine.retentions ?? []).map((r) =>
    Object.freeze({
      retentionId: r.retentionId,
      label: r.label,
      retentionDays: r.retentionDays,
      enforced: true,
      humanReviewRequired: true,
      summary: r.summary,
    })
  );

  appendGovernanceAuditEntry({ groupId, action: "retention_enforcement_registered", entityType: "retention_enforcement" });
  return Object.freeze({ enforcements: Object.freeze(enforcements), explainable: true });
}

export default buildRetentionEnforcementRegistry;
