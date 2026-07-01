import { upsertLegalHold } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildLegalHoldRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ holds: [] });

  const hold = upsertLegalHold(
    Object.freeze({
      holdId: `fhold-${groupId}-default`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Legal hold disponível",
      summary: "Suspensão de expurgo disponível para dados sob investigação — requer aprovação.",
      status: "available",
      active: false,
      humanApprovalRequired: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendFortressAuditEntry({ groupId, action: "legal_hold_registered", entityId: hold.holdId, entityType: "hold" });
  return Object.freeze({ holds: Object.freeze([hold]), explainable: true });
}

export default buildLegalHoldRegistry;
