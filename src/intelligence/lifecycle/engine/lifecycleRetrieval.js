import {
  listLifecycleDocs,
  listLifecycleRules,
  listArchiveRules,
  listExpungeRules,
  listHoldRules,
  listLifecycleSchedules,
  listLifecycleEvents,
  listArchiveLifecycles,
  listExpungeApprovals,
  listHoldEnforcements,
  listDataStates,
  listDataClassifications,
  listRetentionExecutions,
  listArchiveExecutions,
  listExpungeExecutions,
  listLifecycleComplianceRecords,
  listLifecycleExceptions,
  listLifecycleReviews,
  listLifecycleAlerts,
  listLifecycleAuditTrail,
} from "./lifecycleStore.js";
import { explainLifecycleRule } from "./lifecycleExplainability.js";

export function retrieveLifecycleByContext(groupId, options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    groupId,
    retrievedAt: new Date().toISOString(),
    lifecycleDocs: listLifecycleDocs(groupId, { limit: 5 }),
    lifecycleRules: listLifecycleRules(groupId, { limit }),
    archiveRules: listArchiveRules(groupId, { limit }),
    expungeRules: listExpungeRules(groupId, { limit }),
    holdRules: listHoldRules(groupId, { limit }),
    schedules: listLifecycleSchedules(groupId, { limit }),
    events: listLifecycleEvents(groupId, { limit: 50 }),
    archiveLifecycles: listArchiveLifecycles(groupId, { limit }),
    expungeApprovals: listExpungeApprovals(groupId, { limit }),
    holdEnforcements: listHoldEnforcements(groupId, { limit }),
    dataStates: listDataStates(groupId, { limit }),
    classifications: listDataClassifications(groupId, { limit }),
    retentionExecutions: listRetentionExecutions(groupId, { limit }),
    archiveExecutions: listArchiveExecutions(groupId, { limit }),
    expungeExecutions: listExpungeExecutions(groupId, { limit }),
    complianceRecords: listLifecycleComplianceRecords(groupId, { limit }),
    exceptions: listLifecycleExceptions(groupId, { limit }),
    reviews: listLifecycleReviews(groupId, { limit }),
    alerts: listLifecycleAlerts(groupId, { limit: 10 }),
    auditTrail: listLifecycleAuditTrail(groupId, { limit: 50 }),
    explainable: true,
    expungeRequiresPolicyAndAudit: true,
    archiveRequiresPolicyAndAudit: true,
    crossTenantMixingForbidden: true,
  });
}

export function retrieveLatestLifecycle(groupId) {
  const retrieved = retrieveLifecycleByContext(groupId);
  const topDoc = retrieved.lifecycleDocs[0];
  return Object.freeze({
    ...retrieved,
    topDoc,
    explainability: Object.freeze({
      top: topDoc ? explainLifecycleRule(topDoc) : null,
    }),
  });
}

export default { retrieveLifecycleByContext, retrieveLatestLifecycle };
