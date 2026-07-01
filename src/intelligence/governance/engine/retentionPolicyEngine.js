import { upsertGovernanceRetention } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildRetentionPolicyEngine(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ retentions: [] });

  const retentions = [
    upsertGovernanceRetention(
      Object.freeze({
        retentionId: `gret-${groupId}-audit`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Retenção de auditoria",
        summary: "Eventos de auditoria mantidos por 24 meses — revisão humana obrigatória para exclusão.",
        retentionDays: 730,
        dataCategory: "audit",
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertGovernanceRetention(
      Object.freeze({
        retentionId: `gret-${groupId}-intelligence`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Retenção de inteligência corporativa",
        summary: "Views de portfólio e governança mantidas conforme política do cliente.",
        retentionDays: 365,
        dataCategory: "intelligence",
        lifecycleState: "active",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendGovernanceAuditEntry({ groupId, action: "retention_policies_built", entityType: "retention" });
  return Object.freeze({ retentions: Object.freeze(retentions), explainable: true });
}

export default buildRetentionPolicyEngine;
