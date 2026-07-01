import { listMonitoringEvents, appendMonitoringEvent } from "./durabilitySyncStore.js";

export function recordSyncMonitoringEvent(groupId, tenantId, event) {
  return appendMonitoringEvent(
    Object.freeze({
      groupId,
      tenantId,
      eventType: event.eventType ?? "sync_monitor",
      label: event.label ?? "Evento de monitoramento",
      summary: event.summary ?? "",
    })
  );
}

export function buildSyncMonitoringRegistry(groupId) {
  const events = listMonitoringEvents(groupId, { limit: 30 });
  return Object.freeze({
    groupId,
    events: events.map((e) =>
      Object.freeze({
        id: e.eventId,
        label: e.label,
        context: e.summary,
        eventType: e.eventType,
      })
    ),
    explainable: true,
  });
}

export default { recordSyncMonitoringEvent, buildSyncMonitoringRegistry };
