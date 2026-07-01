import { upsertLifecycleException } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildLifecycleExceptionRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ exceptions: [] });

  appendLifecycleAuditEntry({ groupId, action: "lifecycle_exceptions_checked", entityType: "exception" });
  return Object.freeze({ exceptions: Object.freeze([]), exceptionRequiresAuditTrail: true, explainable: true });
}

export function registerLifecycleException(groupId, partial, ctx) {
  if (!ctx?.authorized) {
    return Object.freeze({ registered: false, reason: "Escopo não autorizado." });
  }
  const exception = upsertLifecycleException(
    Object.freeze({
      exceptionId: partial.exceptionId ?? `lexc-${groupId}-${Date.now()}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      label: partial.label ?? "Exceção de ciclo de vida",
      summary: partial.summary ?? "Exceção registrada com trilha de auditoria.",
      status: "registered",
      exceptionRequiresAuditTrail: true,
      humanApprovalRequired: true,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );
  appendLifecycleAuditEntry({
    groupId,
    action: "lifecycle_exception_registered",
    entityId: exception.exceptionId,
    entityType: "exception",
    humanApproved: partial.humanApproved ?? false,
  });
  return Object.freeze({ registered: true, exception, explainable: true });
}

export default buildLifecycleExceptionRegistry;
