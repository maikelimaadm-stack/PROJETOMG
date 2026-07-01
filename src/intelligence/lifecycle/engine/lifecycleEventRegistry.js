import { upsertLifecycleEvent } from "./lifecycleStore.js";
import { appendLifecycleAuditEntry } from "./lifecycleAuditTrail.js";

export function buildLifecycleEventRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ events: [] });

  const events = [
    upsertLifecycleEvent(
      Object.freeze({
        eventId: `levt-${groupId}-init`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Ciclo de vida inicializado",
        summary: "Registro de ciclo de vida consolidado a partir da Fortress.",
        eventType: "lifecycle.initialized",
        sensitive: false,
        status: "recorded",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertLifecycleEvent(
      Object.freeze({
        eventId: `levt-${groupId}-audit`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Trilha de auditoria ativa",
        summary: "Toda mudança de estado exige registro e explicabilidade.",
        eventType: "lifecycle.audit_trail",
        sensitive: true,
        status: "recorded",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendLifecycleAuditEntry({ groupId, action: "lifecycle_events_built", entityType: "lifecycle_event" });
  return Object.freeze({ events: Object.freeze(events), explainable: true });
}

export default buildLifecycleEventRegistry;
