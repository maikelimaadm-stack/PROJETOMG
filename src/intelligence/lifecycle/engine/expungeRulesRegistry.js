import { upsertExpungeRule } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildExpungeRulesRegistry(groupId, ctx, lifecycleRules) {
  if (!ctx.authorized) return Object.freeze({ rules: [], expungeAllowed: false });

  const rules = (lifecycleRules.rules ?? []).map((lr) =>
    upsertExpungeRule(
      Object.freeze({
        ruleId: `exprule-${lr.ruleId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: `Expurgo: ${lr.dataCategory}`,
        summary: `Expurgo de ${lr.dataCategory} exige política, aprovação humana e trilha de auditoria.`,
        dataCategory: lr.dataCategory,
        status: "active",
        expungeAllowed: false,
        expungeRequiresPolicyAndAudit: true,
        humanApprovalRequired: true,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "expunge_rules_built", entityType: "expunge_rule" });
  return Object.freeze({
    rules: Object.freeze(rules),
    expungeAllowed: false,
    expungeRequiresPolicyAndAudit: true,
    explainable: true,
  });
}

export default buildExpungeRulesRegistry;
