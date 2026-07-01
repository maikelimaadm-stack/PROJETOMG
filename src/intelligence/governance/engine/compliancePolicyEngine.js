import { upsertGovernanceCompliance } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildCompliancePolicyEngine(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ compliances: [] });

  const compliances = [
    upsertGovernanceCompliance(
      Object.freeze({
        complianceId: `gcomp-${groupId}-isolation`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Isolamento entre tenants",
        summary: "Nenhuma mistura de dados entre empresas não autorizadas.",
        status: "compliant",
        rule: "cross_tenant_mixing_forbidden",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertGovernanceCompliance(
      Object.freeze({
        complianceId: `gcomp-${groupId}-authorization`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Autorização de escopo de grupo",
        summary: "Visão corporativa liberada somente com escopo registrado.",
        status: "compliant",
        rule: "group_scope_required",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertGovernanceCompliance(
      Object.freeze({
        complianceId: `gcomp-${groupId}-human-approval`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Aprovação humana para mudanças sensíveis",
        summary: "Alterações de política e escopo exigem decisão administrativa.",
        status: "compliant",
        rule: "human_approval_required",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendGovernanceAuditEntry({ groupId, action: "compliance_policies_built", entityType: "compliance" });
  return Object.freeze({ compliances: Object.freeze(compliances), explainable: true });
}

export default buildCompliancePolicyEngine;
