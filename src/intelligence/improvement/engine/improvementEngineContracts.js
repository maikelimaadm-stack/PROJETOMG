/** Continuous Improvement Engine contracts — Program 3.21, D-087 */

export const IMPROVEMENT_ENGINE_VERSION = "mak-improvement-engine-v1";
export const IMPROVEMENT_STORE_VERSION = "mak-improvement-store-v1";

export const IMPROVEMENT_DOCUMENT_TYPES = Object.freeze({
  LOOP: "improvement.loop",
  PLAN: "improvement.plan",
  MILESTONE: "improvement.milestone",
  SIGNAL: "improvement.signal",
  OPPORTUNITY: "improvement.opportunity",
});

export const IMPROVEMENT_SIGNAL_TYPES = Object.freeze({
  ADOPTION_OUTCOME: "improvement.signal.adoption_outcome",
  MATURITY_GAP: "improvement.signal.maturity_gap",
  WORKFLOW_FRICTION: "improvement.signal.workflow_friction",
  CORPORATE_BENCHMARK: "improvement.signal.corporate_benchmark",
  EVOLUTION_PROGRESS: "improvement.signal.evolution_progress",
});

export const IMPROVEMENT_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "observing",
  "in_cycle",
  "validating",
  "completed",
  "archived",
]);

export const IMPROVEMENT_OWNERSHIP = Object.freeze({
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

export const IMPROVEMENT_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "business.optimization_loop", implemented: true, consumes: ["improvement.engine"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default IMPROVEMENT_ENGINE_VERSION;
