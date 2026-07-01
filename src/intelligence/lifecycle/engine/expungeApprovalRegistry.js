import { upsertExpungeApproval } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildExpungeApprovalRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ approvals: [], expungeAllowed: false });

  const approval = upsertExpungeApproval(
    Object.freeze({
      approvalId: `eappr-${groupId}-pending`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Expurgo — aguardando aprovação",
      summary: "Nenhum expurgo físico sem política válida, aprovação humana e trilha de auditoria.",
      status: "pending_approval",
      expungeAllowed: false,
      humanApprovalRequired: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendLifecycleAuditEntry({ groupId, action: "expunge_approval_registry_built", entityType: "expunge_approval" });
  return Object.freeze({
    approvals: Object.freeze([approval]),
    expungeAllowed: false,
    expungeRequiresPolicyAndAudit: true,
    explainable: true,
  });
}

export default buildExpungeApprovalRegistry;
