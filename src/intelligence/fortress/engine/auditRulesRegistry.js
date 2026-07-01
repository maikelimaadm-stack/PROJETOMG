import { upsertAuditRule } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildAuditRulesRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ rules: [] });

  const rules = [
    upsertAuditRule(
      Object.freeze({
        ruleId: `faud-${groupId}-sensitive`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Auditoria de ações sensíveis",
        summary: "Mudanças de escopo, política, retenção e expurgo geram trilha reforçada.",
        auditRequired: true,
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertAuditRule(
      Object.freeze({
        ruleId: `faud-${groupId}-exception`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Auditoria de exceções",
        summary: "Toda exceção de compliance ou retenção deve ser registrada e revisada.",
        auditRequired: true,
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendFortressAuditEntry({ groupId, action: "audit_rules_built", entityType: "audit_rule" });
  return Object.freeze({ rules: Object.freeze(rules), explainable: true });
}

export default buildAuditRulesRegistry;
