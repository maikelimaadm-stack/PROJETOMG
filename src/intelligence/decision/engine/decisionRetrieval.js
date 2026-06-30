import {
  listDecisionDocuments,
  listDecisionOptions,
  listDecisionScenarios,
  listDecisionEvidence,
} from "./decisionEngineStore.js";

export function retrieveDecisionsByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  const documents = listDecisionDocuments(tenantId, { limit });
  let pending = documents.filter((d) => d.lifecycleState === "pending_approval" || d.lifecycleState === "draft");
  if (options.pendingOnly) pending = pending.slice(0, limit);

  const allOptions = listDecisionOptions(tenantId, { limit: limit * 3 });
  const allScenarios = listDecisionScenarios(tenantId, { limit });
  const allEvidence = listDecisionEvidence(tenantId, { limit });

  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    documents,
    pendingDecisions: pending,
    options: allOptions,
    scenarios: allScenarios,
    evidence: allEvidence,
    explainable: true,
  });
}

export default retrieveDecisionsByContext;
