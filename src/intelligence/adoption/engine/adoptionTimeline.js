import { listAdoptionEvents, listAdoptionMilestones } from "./adoptionEngineStore.js";

export function buildAdoptionTimeline(tenantId) {
  const events = listAdoptionEvents(tenantId, { limit: 30 });
  const milestones = listAdoptionMilestones(tenantId, { limit: 20 });

  const timelineEntries = [
    ...events.map((e) =>
      Object.freeze({
        id: e.eventId,
        type: "event",
        label: e.action ?? e.label ?? "Evento de adoção",
        timestamp: e.recordedAt ?? e.createdAt,
        explainable: true,
      })
    ),
    ...milestones
      .filter((m) => m.achieved)
      .map((m) =>
        Object.freeze({
          id: m.milestoneId,
          type: "milestone",
          label: m.label,
          timestamp: m.achievedAt ?? m.recordedAt,
          progressPercent: m.progressPercent,
          explainable: true,
        })
      ),
  ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    entries: Object.freeze(timelineEntries.slice(0, 20)),
    explainable: true,
    individualProfilingForbidden: true,
  });
}

export default buildAdoptionTimeline;
