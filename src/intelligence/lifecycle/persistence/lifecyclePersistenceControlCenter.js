import { summarizeLifecyclePersistence } from "./lifecyclePersistenceSummaries.js";
import { retrievePersistentLifecycle } from "./lifecyclePersistenceRetrieval.js";

export function buildLifecyclePersistenceControlCenter(groupId, ctx) {
  if (!ctx?.authorized) {
    return Object.freeze({ available: false, reason: ctx?.reason ?? "Indisponível." });
  }
  const summary = summarizeLifecyclePersistence(groupId);
  const data = retrievePersistentLifecycle(groupId);
  return Object.freeze({
    available: true,
    groupId,
    headline: summary.headline,
    pendingApprovals: summary.pendingApprovals,
    queueCount: summary.queueCount,
    storageEvents: data.storageEvents.length,
    backupEvents: data.backupEvents.length,
    durable: true,
    explainable: true,
    humanApprovalRequired: true,
  });
}

export default buildLifecyclePersistenceControlCenter;
