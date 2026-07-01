import { upsertAuditEvent } from "./fortressStore.js";
import { appendFortressAuditEntry } from "./auditFortressAuditTrail.js";

export function buildAuditEventRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ events: [] });

  const events = [
    upsertAuditEvent(
      Object.freeze({
        eventId: `fevt-${groupId}-governance`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Análise de governança",
        summary: "Evento de governança registrado no fortress.",
        category: "governance",
        sensitive: true,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertAuditEvent(
      Object.freeze({
        eventId: `fevt-${groupId}-compliance`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Fortress de compliance analisado",
        summary: "Regras de conformidade validadas para o escopo autorizado.",
        category: "compliance",
        sensitive: false,
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  if (ctx.governanceAuditTrail?.length) {
    ctx.governanceAuditTrail.slice(0, 3).forEach((entry, i) => {
      events.push(
        upsertAuditEvent(
          Object.freeze({
            eventId: `fevt-${groupId}-inherit-${i}`,
            groupId,
            authorizedTenantIds: ctx.authorizedTenantIds,
            label: `Herança: ${entry.action}`,
            summary: "Evento herdado da trilha de governança.",
            category: "inherited",
            sensitive: entry.entityType === "policy",
            explainable: true,
            recordedAt: entry.recordedAt,
          })
        )
      );
    });
  }

  appendFortressAuditEntry({ groupId, action: "audit_events_built", entityType: "audit_event" });
  return Object.freeze({ events: Object.freeze(events), explainable: true });
}

export default buildAuditEventRegistry;
