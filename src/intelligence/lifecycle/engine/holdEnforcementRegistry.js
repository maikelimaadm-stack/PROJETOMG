import { upsertHoldEnforcement } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildHoldEnforcementRegistry(groupId, ctx, holdRules) {
  if (!ctx.authorized) return Object.freeze({ enforcements: [] });

  const enforcements = (holdRules.rules ?? []).map((r) =>
    upsertHoldEnforcement(
      Object.freeze({
        enforcementId: `henf-${r.ruleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        ruleId: r.ruleId,
        label: r.label,
        summary: "Legal hold disponível. Remoção exige autorização e auditoria.",
        active: false,
        holdRemovalRequiresAuthorization: true,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "hold_enforcement_built", entityType: "hold_enforcement" });
  return Object.freeze({ enforcements: Object.freeze(enforcements), explainable: true });
}

export default buildHoldEnforcementRegistry;
