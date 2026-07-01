import { upsertArchiveRule } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildArchiveRulesRegistry(groupId, ctx, lifecycleRules) {
  if (!ctx.authorized) return Object.freeze({ rules: [] });

  const rules = (lifecycleRules.rules ?? []).map((lr) =>
    upsertArchiveRule(
      Object.freeze({
        ruleId: `archrule-${lr.ruleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: `Arquivamento: ${lr.dataCategory}`,
        summary: `Dados ${lr.dataCategory} elegíveis para arquivamento com origem rastreável.`,
        dataCategory: lr.dataCategory,
        status: "active",
        archiveRequiresPolicyAndAudit: true,
        humanApprovalRequired: true,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "archive_rules_built", entityType: "archive_rule" });
  return Object.freeze({ rules: Object.freeze(rules), explainable: true });
}

export default buildArchiveRulesRegistry;
