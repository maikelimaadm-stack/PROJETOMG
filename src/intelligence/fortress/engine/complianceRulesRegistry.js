import { upsertComplianceRule } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildComplianceRulesRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ rules: [] });

  const rules = [
    upsertComplianceRule(
      Object.freeze({
        ruleId: `fcomp-${groupId}-isolation`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Isolamento entre tenants",
        summary: "Nenhuma mistura de dados entre empresas não autorizadas.",
        status: "active",
        ruleType: "tenant_isolation",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertComplianceRule(
      Object.freeze({
        ruleId: `fcomp-${groupId}-exposure`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Exposição de inteligência corporativa",
        summary: "Dados sensíveis só expostos com escopo e política válidos.",
        status: "active",
        ruleType: "data_exposure",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertComplianceRule(
      Object.freeze({
        ruleId: `fcomp-${groupId}-human`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Aprovação humana para ações sensíveis",
        summary: "Expurgo, exceção e mudança de política exigem decisão administrativa.",
        status: "active",
        ruleType: "human_approval",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendFortressAuditEntry({ groupId, action: "compliance_rules_built", entityType: "compliance_rule" });
  return Object.freeze({ rules: Object.freeze(rules), explainable: true });
}

export default buildComplianceRulesRegistry;
