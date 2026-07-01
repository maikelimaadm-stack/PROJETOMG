import { upsertRetentionRule } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildRetentionRulesRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ rules: [] });

  const rules = [
    upsertRetentionRule(
      Object.freeze({
        ruleId: `fret-${groupId}-audit`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Retenção de auditoria",
        summary: "Eventos de auditoria mantidos por 24 meses.",
        retentionDays: 730,
        dataCategory: "audit",
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertRetentionRule(
      Object.freeze({
        ruleId: `fret-${groupId}-intelligence`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Retenção de inteligência corporativa",
        summary: "Views de portfólio e governança mantidas por 12 meses.",
        retentionDays: 365,
        dataCategory: "intelligence",
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertRetentionRule(
      Object.freeze({
        ruleId: `fret-${groupId}-memory`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Retenção de memória operacional",
        summary: "Registros de memória enterprise mantidos por 18 meses.",
        retentionDays: 548,
        dataCategory: "memory",
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendFortressAuditEntry({ groupId, action: "retention_rules_built", entityType: "retention_rule" });
  return Object.freeze({ rules: Object.freeze(rules), explainable: true });
}

export default buildRetentionRulesRegistry;
