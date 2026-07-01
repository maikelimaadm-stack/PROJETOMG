/** Recommendation & Replication Engine contracts — Program 3.19, D-085 */

export const RECOMMENDATION_ENGINE_VERSION = "mak-recommendation-engine-v1";
export const REPLICATION_ENGINE_VERSION = "mak-replication-engine-v1";
export const RECOMMENDATION_STORE_VERSION = "mak-recommendation-store-v1";

export const RECOMMENDATION_DOCUMENT_TYPES = Object.freeze({
  RECOMMENDATION: "recommendation.document",
  PLAN: "recommendation.plan",
  SIGNAL: "recommendation.signal",
  CANDIDATE: "recommendation.candidate",
});

export const REPLICATION_DOCUMENT_TYPES = Object.freeze({
  REPLICATION: "replication.document",
  TARGET: "replication.target",
  PLAN: "replication.plan",
});

export const RECOMMENDATION_SIGNAL_TYPES = Object.freeze({
  MATURITY_GAP: "recommendation.signal.maturity_gap",
  TEMPLATE_MATCH: "recommendation.signal.template_match",
  PRACTICE_REFERENCE: "recommendation.signal.practice_reference",
  EVOLUTION_OPPORTUNITY: "recommendation.signal.evolution_opportunity",
  SEGMENT_ALIGNMENT: "recommendation.signal.segment_alignment",
});

export const RECOMMENDATION_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "proposed",
  "approved",
  "deferred",
  "archived",
]);

export const REPLICATION_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "proposed",
  "pending_approval",
  "approved",
  "rejected",
  "archived",
]);

export const RECOMMENDATION_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  individualProfilingForbidden: true,
  surveillanceForbidden: true,
  autonomousExecutionForbidden: true,
  humanApprovalRequired: true,
  portfolioRequiresAuthorization: true,
  crossTenantMixingForbidden: true,
});

export const RECOMMENDATION_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default RECOMMENDATION_ENGINE_VERSION;
