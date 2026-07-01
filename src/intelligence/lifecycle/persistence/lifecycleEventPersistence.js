import { upsertApprovalRequest, appendDurableAuditEntry } from "./durableLifecycleStore.js";

export function persistLifecycleEvent(groupId, tenantId, event) {
  appendDurableAuditEntry({
    groupId,
    tenantId,
    action: event.eventType ?? "lifecycle_event",
    entityId: event.eventId ?? null,
    entityType: "lifecycle_event",
    summary: event.summary ?? event.label ?? "",
    humanApproved: event.humanApproved ?? false,
  });
  return Object.freeze({ persisted: true, explainable: true });
}

export default persistLifecycleEvent;
