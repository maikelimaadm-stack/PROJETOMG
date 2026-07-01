import { upsertGovernanceScope } from "./platformGovernanceStore.js";
import { appendGovernanceAuditEntry } from "./governanceAuditTrail.js";

export function manageAuthorizedGroupScope(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ authorized: false, scopes: [] });

  const scope = upsertGovernanceScope(
    Object.freeze({
      scopeId: `gscope-${groupId}`,
      groupId,
      ownerClientId: ctx.ownerClientId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Escopo de grupo autorizado",
      summary: `${ctx.authorizedTenantIds.length} empresa(s) autorizadas neste grupo.`,
      aggregationAllowed: true,
      comparisonAllowed: true,
      corporateViewAllowed: true,
      lifecycleState: "active",
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendGovernanceAuditEntry({
    groupId,
    action: "group_scope_registered",
    entityId: scope.scopeId,
    entityType: "scope",
  });

  return Object.freeze({ authorized: true, scopes: Object.freeze([scope]), explainable: true });
}

export default manageAuthorizedGroupScope;
