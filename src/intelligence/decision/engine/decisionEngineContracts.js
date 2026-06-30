/** Enterprise Decision Engine contracts — Program 3.15, D-081 */

export const ENTERPRISE_DECISION_ENGINE_VERSION = "mak-enterprise-decision-engine-v1";
export const DECISION_STORE_VERSION = "mak-decision-store-v1";
export const DECISION_DOCUMENT_SCHEMA_VERSION = "mak-decision-document-v1";
export const DECISION_OPTION_SCHEMA_VERSION = "mak-decision-option-v1";
export const DECISION_SCENARIO_SCHEMA_VERSION = "mak-decision-scenario-v1";

export const DECISION_DOCUMENT_TYPES = Object.freeze({
  ANALYSIS: "decision.document.analysis",
  PENDING: "decision.document.pending",
  APPROVED: "decision.document.approved",
  REJECTED: "decision.document.rejected",
  DEFERRED: "decision.document.deferred",
});

export const DECISION_OPTION_TYPES = Object.freeze({
  APPROVE: "decision.option.approve",
  REJECT: "decision.option.reject",
  DEFER: "decision.option.defer",
  ALTERNATIVE: "decision.option.alternative",
});

export const DECISION_CONFIDENCE_LEVELS = Object.freeze(["low", "medium", "high"]);

export const DECISION_LIFECYCLE_STATES = Object.freeze([
  "draft",
  "pending_approval",
  "approved",
  "rejected",
  "deferred",
  "archived",
]);

export const DECISION_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  autonomousExecutionForbidden: true,
  humanApprovalRequired: true,
});

export const DECISION_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "evolution.engine", implemented: false, consumes: ["decision.engine"] }),
  Object.freeze({ id: "intent.engine", implemented: false, consumes: ["decision.engine"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default ENTERPRISE_DECISION_ENGINE_VERSION;
