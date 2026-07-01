import { upsertExpungeRecord } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildExpiryExpungeRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ expunges: [], purgeAllowed: false });

  const expunge = upsertExpungeRecord(
    Object.freeze({
      expungeId: `fexp-${groupId}-pending`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Expurgo controlado — aguardando aprovação",
      summary: "Nenhum expurgo automático. Decisão humana e trilha de auditoria obrigatórias.",
      status: "pending_approval",
      purgeAllowed: false,
      humanApprovalRequired: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendFortressAuditEntry({ groupId, action: "expunge_registry_built", entityId: expunge.expungeId, entityType: "expunge" });
  return Object.freeze({
    expunges: Object.freeze([expunge]),
    purgeAllowed: false,
    purgeRequiresPolicyAndAudit: true,
    explainable: true,
  });
}

export default buildExpiryExpungeRegistry;
