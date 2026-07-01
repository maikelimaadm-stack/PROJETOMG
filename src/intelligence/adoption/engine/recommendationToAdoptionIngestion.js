/**
 * Recommendation → Adoption Tracking ingestion.
 */
import { assembleAdoptionContext } from "./adoptionContextAssembly.js";
import { createAdoptionRecord, upsertAdoption } from "./adoptionEngineStore.js";
import { buildAdoptionPlans } from "./adoptionPlans.js";
import { buildAdoptionMilestones } from "./adoptionMilestones.js";
import { registerAdoptionEvidence } from "./adoptionEvidence.js";
import { registerAdoptionOutcomes } from "./adoptionOutcomes.js";
import { buildAdoptionLineage } from "./adoptionLineage.js";
import { registerAdoptionVersion } from "./adoptionVersioning.js";
import { appendAdoptionAuditEntry } from "./adoptionAuditTrail.js";
import { ADOPTION_ENGINE_VERSION, ADOPTION_OWNERSHIP, ADOPTION_STATUS_TYPES } from "./adoptionEngineContracts.js";
import { ingestAdoptionToCorporateIntelligence } from "../../corporate/engine/adoptionToCorporateIngestion.js";

export function analyzeAdoptionContext(tenantId = "default", options = {}) {
  const ctx = assembleAdoptionContext(tenantId, options);
  const adoptions = [];

  const recommendations = ctx.recommendations ?? [];
  for (let i = 0; i < recommendations.slice(0, 5).length; i++) {
    const rec = recommendations[i];
    const status =
      i === 0
        ? ADOPTION_STATUS_TYPES.IN_PROGRESS
        : i === 1
          ? ADOPTION_STATUS_TYPES.ACCEPTED
          : i === 2
            ? ADOPTION_STATUS_TYPES.REJECTED
            : ADOPTION_STATUS_TYPES.PROPOSED;

    const progressPercent =
      status === ADOPTION_STATUS_TYPES.IN_PROGRESS
        ? 60
        : status === ADOPTION_STATUS_TYPES.ACCEPTED
          ? 40
          : status === ADOPTION_STATUS_TYPES.COMPLETED
            ? 100
            : status === ADOPTION_STATUS_TYPES.REJECTED
              ? 0
              : 10;

    const adoption = createAdoptionRecord({
      tenantId,
      recommendationId: rec.recommendationId,
      title: `Adoção: ${rec.title}`,
      summary: rec.summary ?? rec.expectedImpact ?? "",
      status,
      progressPercent,
      lineage: buildAdoptionLineage({ recommendationId: rec.recommendationId }),
    });
    upsertAdoption(adoption);
    registerAdoptionVersion(tenantId, adoption.adoptionId);
    adoptions.push(adoption);
  }

  const { plans } = buildAdoptionPlans(tenantId, adoptions);
  const { milestones } = buildAdoptionMilestones(tenantId, adoptions);
  const { evidence } = registerAdoptionEvidence(tenantId, adoptions, ctx);
  const { outcomes } = registerAdoptionOutcomes(tenantId, adoptions);

  appendAdoptionAuditEntry({
    tenantId,
    action: "adoption_analyzed",
    entityId: adoptions[0]?.adoptionId ?? null,
    entityType: "analysis",
  });

  try {
    if (options.groupId) {
      ingestAdoptionToCorporateIntelligence(tenantId, { ...options, adoptions });
    }
  } catch {
    // non-blocking — corporate intelligence must not break adoption pipeline
  }

  return Object.freeze({
    tenantId,
    analyzedAt: new Date().toISOString(),
    engineVersion: ADOPTION_ENGINE_VERSION,
    adoptions,
    plans,
    milestones,
    evidence,
    outcomes,
    ...ADOPTION_OWNERSHIP,
    explainable: true,
  });
}

export function ingestRecommendationToAdoption(tenantId = "default", options = {}) {
  return analyzeAdoptionContext(tenantId, options);
}

export function replayAdoptionFromStack(tenantId = "default", options = {}) {
  return analyzeAdoptionContext(tenantId, options);
}

export default {
  analyzeAdoptionContext,
  ingestRecommendationToAdoption,
  replayAdoptionFromStack,
};
