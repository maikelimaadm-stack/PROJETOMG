import {
  listGovernanceDocuments,
  listGovernanceScopes,
  listGovernancePermissions,
  listGovernancePolicies,
  listGovernanceRetentions,
  listGovernanceAudits,
  listGovernanceCompliances,
  listAdminScopes,
  listGovernanceAlerts,
} from "./platformGovernanceStore.js";
import { explainGovernanceDocument } from "./governanceExplainability.js";

export function retrieveGovernanceByContext(groupId, options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    groupId,
    retrievedAt: new Date().toISOString(),
    documents: listGovernanceDocuments(groupId, { limit: 5 }),
    scopes: listGovernanceScopes(groupId, { limit }),
    permissions: listGovernancePermissions(groupId, { limit }),
    policies: listGovernancePolicies(groupId, { limit }),
    retentions: listGovernanceRetentions(groupId, { limit }),
    audits: listGovernanceAudits(groupId, { limit: 50 }),
    compliances: listGovernanceCompliances(groupId, { limit }),
    adminScopes: listAdminScopes(groupId, { limit }),
    alerts: listGovernanceAlerts(groupId, { limit: 10 }),
    explainable: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    policyChangeRequiresAudit: true,
  });
}

export function retrieveLatestGovernance(groupId) {
  const retrieved = retrieveGovernanceByContext(groupId);
  const topDocument = retrieved.documents[0];
  return Object.freeze({
    ...retrieved,
    topDocument,
    explainability: Object.freeze({
      top: topDocument ? explainGovernanceDocument(topDocument) : null,
    }),
  });
}

export default { retrieveGovernanceByContext, retrieveLatestGovernance };
