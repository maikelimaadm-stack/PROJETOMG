/** Adoption Tracking Engine contracts — Program 3.20, D-086 */

export const ADOPTION_ENGINE_VERSION = "mak-adoption-engine-v1";
export const ADOPTION_STORE_VERSION = "mak-adoption-store-v1";

export const ADOPTION_DOCUMENT_TYPES = Object.freeze({
  ADOPTION: "adoption.document",
  PLAN: "adoption.plan",
  MILESTONE: "adoption.milestone",
  EVIDENCE: "adoption.evidence",
  OUTCOME: "adoption.outcome",
});

export const ADOPTION_STATUS_TYPES = Object.freeze({
  PROPOSED: "adoption.status.proposed",
  ACCEPTED: "adoption.status.accepted",
  REJECTED: "adoption.status.rejected",
  IN_PROGRESS: "adoption.status.in_progress",
  COMPLETED: "adoption.status.completed",
  VALIDATING: "adoption.status.validating",
  DEFERRED: "adoption.status.deferred",
});

export const ADOPTION_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "tracking",
  "in_progress",
  "validating",
  "completed",
  "rejected",
  "archived",
]);

export const ADOPTION_OWNERSHIP = Object.freeze({
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

export const ADOPTION_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "business.corporate_intelligence", implemented: true, consumes: ["adoption.engine"] }),
  Object.freeze({ id: "business.continuous_improvement", implemented: true, consumes: ["adoption.engine"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default ADOPTION_ENGINE_VERSION;
