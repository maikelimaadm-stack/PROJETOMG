/** Optimization Loop Engine contracts — Program 3.21, D-087 */

export const OPTIMIZATION_ENGINE_VERSION = "mak-optimization-engine-v1";
export const OPTIMIZATION_STORE_VERSION = "mak-optimization-store-v1";

export const OPTIMIZATION_DOCUMENT_TYPES = Object.freeze({
  LOOP: "optimization.loop",
  PLAN: "optimization.plan",
  MILESTONE: "optimization.milestone",
  SIGNAL: "optimization.signal",
  OPPORTUNITY: "optimization.opportunity",
});

export const OPTIMIZATION_SIGNAL_TYPES = Object.freeze({
  IMPROVEMENT_EFFECT: "optimization.signal.improvement_effect",
  WASTE_REDUCTION: "optimization.signal.waste_reduction",
  CAPACITY_GAP: "optimization.signal.capacity_gap",
  BENCHMARK_DELTA: "optimization.signal.benchmark_delta",
  ADOPTION_FEEDBACK: "optimization.signal.adoption_feedback",
});

export const OPTIMIZATION_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "proposed",
  "in_loop",
  "measuring",
  "completed",
  "archived",
]);

export const OPTIMIZATION_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  groupScopedRequiresAuthorization: true,
  individualProfilingForbidden: true,
  surveillanceForbidden: true,
  autonomousExecutionForbidden: true,
  humanApprovalRequired: true,
  crossTenantMixingForbidden: true,
  unauthorizedAggregationForbidden: true,
});

export const OPTIMIZATION_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default OPTIMIZATION_ENGINE_VERSION;
