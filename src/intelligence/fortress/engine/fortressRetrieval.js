import {
  listComplianceDocs,
  listRetentionDocs,
  listAuditDocs,
  listComplianceRules,
  listRetentionRules,
  listAuditRules,
  listRetentionSchedules,
  listExpungeRecords,
  listLegalHolds,
  listArchiveRecords,
  listAuditEvents,
  listFortressReviews,
  listFortressExceptions,
  listFortressAlerts,
} from "./fortressStore.js";
import { explainComplianceRule } from "./complianceExplainability.js";

export function retrieveFortressByContext(groupId, options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    groupId,
    retrievedAt: new Date().toISOString(),
    complianceDocs: listComplianceDocs(groupId, { limit: 5 }),
    retentionDocs: listRetentionDocs(groupId, { limit: 5 }),
    auditDocs: listAuditDocs(groupId, { limit: 5 }),
    complianceRules: listComplianceRules(groupId, { limit }),
    retentionRules: listRetentionRules(groupId, { limit }),
    auditRules: listAuditRules(groupId, { limit }),
    schedules: listRetentionSchedules(groupId, { limit }),
    expunges: listExpungeRecords(groupId, { limit }),
    holds: listLegalHolds(groupId, { limit }),
    archives: listArchiveRecords(groupId, { limit }),
    auditEvents: listAuditEvents(groupId, { limit: 50 }),
    reviews: listFortressReviews(groupId, { limit }),
    exceptions: listFortressExceptions(groupId, { limit }),
    alerts: listFortressAlerts(groupId, { limit: 10 }),
    explainable: true,
    purgeRequiresPolicyAndAudit: true,
    crossTenantMixingForbidden: true,
  });
}

export function retrieveLatestFortress(groupId) {
  const retrieved = retrieveFortressByContext(groupId);
  const topCompliance = retrieved.complianceDocs[0];
  return Object.freeze({
    ...retrieved,
    topCompliance,
    explainability: Object.freeze({
      top: topCompliance ? explainComplianceRule(topCompliance) : null,
    }),
  });
}

export default { retrieveFortressByContext, retrieveLatestFortress };
