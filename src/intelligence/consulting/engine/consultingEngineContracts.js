/** Enterprise Consulting Engine contracts — Program 3.14, D-080 */

export const ENTERPRISE_CONSULTING_ENGINE_VERSION = "mak-enterprise-consulting-engine-v1";
export const CONSULTING_STORE_VERSION = "mak-consulting-store-v1";
export const CONSULTING_DOCUMENT_SCHEMA_VERSION = "mak-consulting-document-v1";
export const CONSULTING_RECOMMENDATION_SCHEMA_VERSION = "mak-consulting-recommendation-v1";
export const IMPROVEMENT_PLAN_SCHEMA_VERSION = "mak-improvement-plan-v1";

export const CONSULTING_DOCUMENT_TYPES = Object.freeze({
  ANALYSIS: "consulting.document.analysis",
  OPPORTUNITY: "consulting.document.opportunity",
  PLAN: "consulting.document.plan",
  RECOMMENDATION: "consulting.document.recommendation",
});

export const CONSULTING_SIGNAL_TYPES = Object.freeze({
  HEALTH_DECLINE: "consulting.signal.health_decline",
  BOTTLENECK: "consulting.signal.bottleneck",
  WASTE: "consulting.signal.waste",
  REWORK: "consulting.signal.rework",
  RISK: "consulting.signal.risk",
  IMPROVEMENT: "consulting.signal.improvement",
  PATTERN: "consulting.signal.pattern",
});

export const CONSULTING_PRIORITY_LEVELS = Object.freeze(["low", "medium", "high", "critical"]);

export const CONSULTING_CONFIDENCE_LEVELS = Object.freeze(["low", "medium", "high"]);

export const CONSULTING_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "suggested",
  "reviewed",
  "approved",
  "archived",
]);

export const CONSULTING_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  autonomousExecutionForbidden: true,
  humanApprovalRequired: true,
});

export const CONSULTING_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "decision.engine", implemented: false, consumes: ["consulting.engine"] }),
  Object.freeze({ id: "evolution.engine", implemented: false, consumes: ["consulting.engine"] }),
  Object.freeze({ id: "intent.engine", implemented: false, consumes: ["consulting.engine"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default ENTERPRISE_CONSULTING_ENGINE_VERSION;
