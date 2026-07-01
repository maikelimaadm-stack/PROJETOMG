import { listDurableAuditEntries } from "./durableLifecycleStore.js";

export function buildLifecycleAuditReview(groupId) {
  const entries = listDurableAuditEntries(groupId, { limit: 20 });
  const sensitive = entries.filter((e) => e.action.includes("expunge") || e.action.includes("approval"));
  return Object.freeze({
    groupId,
    totalEntries: entries.length,
    sensitiveCount: sensitive.length,
    requiresReview: sensitive.some((e) => e.humanApproved === false),
    explainable: true,
  });
}

export default buildLifecycleAuditReview;
