import { upsertHoldRule } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildHoldRulesRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ rules: [] });

  const hold = upsertHoldRule(
    Object.freeze({
      ruleId: `holdrule-${groupId}-legal`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Legal hold corporativo",
      summary: "Suspensão de arquivamento e expurgo enquanto hold estiver ativo.",
      status: "active",
      holdRemovalRequiresAuthorization: true,
      humanApprovalRequired: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendLifecycleAuditEntry({ groupId, action: "hold_rules_built", entityType: "hold_rule" });
  return Object.freeze({ rules: Object.freeze([hold]), explainable: true });
}

export default buildHoldRulesRegistry;
