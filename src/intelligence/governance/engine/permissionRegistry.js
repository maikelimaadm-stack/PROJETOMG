import { upsertGovernancePermission } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export const GOVERNANCE_PERMISSIONS = Object.freeze({
  VIEW_PORTFOLIO: "governance.permission.view_portfolio",
  COMPARE_TENANTS: "governance.permission.compare_tenants",
  AGGREGATE_DATA: "governance.permission.aggregate_data",
  MANAGE_SCOPE: "governance.permission.manage_scope",
  REVIEW_AUDIT: "governance.permission.review_audit",
  CHANGE_POLICY: "governance.permission.change_policy",
});

export function buildPermissionRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ permissions: [] });

  const basePermissions = [
    { id: GOVERNANCE_PERMISSIONS.VIEW_PORTFOLIO, label: "Visualizar portfólio autorizado", granted: true },
    { id: GOVERNANCE_PERMISSIONS.COMPARE_TENANTS, label: "Comparar empresas autorizadas", granted: true },
    { id: GOVERNANCE_PERMISSIONS.AGGREGATE_DATA, label: "Agregar dados do grupo", granted: true },
    { id: GOVERNANCE_PERMISSIONS.MANAGE_SCOPE, label: "Gerir escopo de grupo", granted: false, requiresHumanApproval: true },
    { id: GOVERNANCE_PERMISSIONS.REVIEW_AUDIT, label: "Revisar auditoria", granted: true },
    { id: GOVERNANCE_PERMISSIONS.CHANGE_POLICY, label: "Alterar políticas", granted: false, requiresHumanApproval: true },
  ];

  const permissions = basePermissions.map((p) =>
    upsertGovernancePermission(
      Object.freeze({
        permissionId: `${p.id}-${groupId}`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        permissionKey: p.id,
        label: p.label,
        granted: p.granted,
        requiresHumanApproval: p.requiresHumanApproval ?? false,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendGovernanceAuditEntry({ groupId, action: "permissions_registered", entityType: "permission" });
  return Object.freeze({ permissions: Object.freeze(permissions), explainable: true });
}

export default buildPermissionRegistry;
