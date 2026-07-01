import { upsertLifecycleRule } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildLifecycleRulesRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ rules: [] });

  const categories = ["operacional", "decisão", "workflow", "memória", "conhecimento"];
  const rules = categories.map((cat) =>
    upsertLifecycleRule(
      Object.freeze({
        ruleId: `lrule-${groupId}-${cat}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: `Ciclo de vida: ${cat}`,
        summary: `Política de ciclo de vida para dados ${cat}. Retenção explícita e trilha obrigatória.`,
        dataCategory: cat,
        status: "active",
        humanApprovalRequired: true,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendLifecycleAuditEntry({ groupId, action: "lifecycle_rules_built", entityType: "lifecycle_rule" });
  return Object.freeze({ rules: Object.freeze(rules), explainable: true });
}

export default buildLifecycleRulesRegistry;
