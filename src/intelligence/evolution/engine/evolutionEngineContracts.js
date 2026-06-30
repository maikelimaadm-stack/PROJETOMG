/** Enterprise Evolution Engine contracts — Program 3.16, D-082 */

export const ENTERPRISE_EVOLUTION_ENGINE_VERSION = "mak-enterprise-evolution-engine-v1";
export const EVOLUTION_STORE_VERSION = "mak-evolution-store-v1";
export const EVOLUTION_DOCUMENT_SCHEMA_VERSION = "mak-evolution-document-v1";
export const EVOLUTION_PLAN_SCHEMA_VERSION = "mak-evolution-plan-v1";
export const EVOLUTION_ROADMAP_SCHEMA_VERSION = "mak-evolution-roadmap-v1";

export const EVOLUTION_DOCUMENT_TYPES = Object.freeze({
  ANALYSIS: "evolution.document.analysis",
  TIMELINE: "evolution.document.timeline",
  MATURITY: "evolution.document.maturity",
  ROADMAP: "evolution.document.roadmap",
  PROGRESS: "evolution.document.progress",
});

export const EVOLUTION_SIGNAL_TYPES = Object.freeze({
  IMPROVEMENT: "evolution.signal.improvement",
  REGRESSION: "evolution.signal.regression",
  MATURITY_GAIN: "evolution.signal.maturity_gain",
  PATTERN: "evolution.signal.pattern",
  TREND: "evolution.signal.trend",
  MILESTONE: "evolution.signal.milestone",
});

export const MATURITY_LEVELS = Object.freeze(["emerging", "developing", "established", "advanced"]);

export const EVOLUTION_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "proposed",
  "tracking",
  "achieved",
  "archived",
]);

export const EVOLUTION_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  autonomousExecutionForbidden: true,
  humanApprovalRequired: true,
});

export const EVOLUTION_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "business.dna", implemented: true, consumes: ["evolution.engine"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default ENTERPRISE_EVOLUTION_ENGINE_VERSION;
