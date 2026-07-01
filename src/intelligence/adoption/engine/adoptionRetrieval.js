import {
  listAdoptions,
  listAdoptionPlans,
  listAdoptionMilestones,
  listAdoptionEvidence,
  listAdoptionOutcomes,
} from "./adoptionEngineStore.js";
import { explainAdoption } from "./adoptionExplainability.js";
import { computeAdoptionProgress } from "./adoptionProgress.js";
import { classifyAdoptionsByStatus } from "./adoptionStatus.js";

export function retrieveAdoptionsByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  const adoptions = listAdoptions(tenantId, { limit });
  const statusBreakdown = classifyAdoptionsByStatus(adoptions);
  const progress = computeAdoptionProgress(tenantId, adoptions);

  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    adoptions,
    plans: listAdoptionPlans(tenantId, { limit }),
    milestones: listAdoptionMilestones(tenantId, { limit: 30 }),
    evidence: listAdoptionEvidence(tenantId, { limit }),
    outcomes: listAdoptionOutcomes(tenantId, { limit }),
    statusBreakdown,
    progress,
    explainable: true,
    humanApprovalRequired: true,
    individualProfilingForbidden: true,
    autonomousExecutionForbidden: true,
  });
}

export function retrieveLatestAdoptions(tenantId = "default") {
  const retrieved = retrieveAdoptionsByContext(tenantId);
  return Object.freeze({
    ...retrieved,
    topAdoption: retrieved.adoptions[0] ?? null,
    explainability: Object.freeze({
      top: retrieved.adoptions[0] ? explainAdoption(retrieved.adoptions[0]) : null,
    }),
  });
}

export default { retrieveAdoptionsByContext, retrieveLatestAdoptions };
