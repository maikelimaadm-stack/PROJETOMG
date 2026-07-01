import { upsertAdminScope } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function buildAdminScopeRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ adminScopes: [] });

  const adminScope = upsertAdminScope(
    Object.freeze({
      adminScopeId: `gadmin-${groupId}`,
      groupId,
      ownerClientId: ctx.ownerClientId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Escopo administrativo do grupo",
      summary: "Administração autorizada para escopo, políticas e auditoria deste grupo.",
      canManageScope: false,
      canReviewAudit: true,
      canViewCompliance: true,
      requiresHumanApproval: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendGovernanceAuditEntry({ groupId, action: "admin_scope_registered", entityId: adminScope.adminScopeId, entityType: "admin_scope" });
  return Object.freeze({ adminScopes: Object.freeze([adminScope]), explainable: true });
}

export default buildAdminScopeRegistry;
