import { listLifecycleEvents, listLifecycleAuditTrail } from "./lifecycleStore.js";

export function buildLifecycleLineage(groupId, options = {}) {
  const events = listLifecycleEvents(groupId, { limit: options.limit ?? 20 });
  const audit = listLifecycleAuditTrail(groupId, { limit: options.limit ?? 20 });

  return Object.freeze({
    groupId,
    builtAt: new Date().toISOString(),
    events: Object.freeze(events),
    auditTrail: Object.freeze(audit),
    lineageComplete: events.length > 0 || audit.length > 0,
    explainable: true,
  });
}

export default buildLifecycleLineage;
