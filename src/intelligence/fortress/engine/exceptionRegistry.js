import { upsertFortressException } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildExceptionRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ exceptions: [] });

  const exception = upsertFortressException(
    Object.freeze({
      exceptionId: `fexc-${groupId}-none`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: "Nenhuma exceção ativa",
      summary: "Exceções de compliance ou retenção serão registradas aqui com trilha de auditoria.",
      status: "none",
      humanApprovalRequired: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendFortressAuditEntry({ groupId, action: "exception_registry_built", entityId: exception.exceptionId, entityType: "exception" });
  return Object.freeze({ exceptions: Object.freeze([exception]), explainable: true });
}

export default buildExceptionRegistry;
