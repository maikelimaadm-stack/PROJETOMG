/** Enterprise Memory Engine contracts — Program 3.12, D-078 */

export const ENTERPRISE_MEMORY_ENGINE_VERSION = "mak-enterprise-memory-engine-v1";
export const ENTERPRISE_MEMORY_STORE_VERSION = "mak-enterprise-memory-store-v1";
export const MEMORY_RECORD_SCHEMA_VERSION = "mak-memory-record-v1";

export const MEMORY_STORE_TYPES = Object.freeze({
  ENTERPRISE: "enterprise.memory.store",
  BUSINESS: "business.memory.store",
  OPERATIONAL: "operational.memory.store",
  DECISION: "decision.memory.store",
  WORKFLOW: "workflow.memory.store",
  INTENT: "intent.memory.store",
  OUTCOME: "outcome.memory.store",
});

export const MEMORY_LIFECYCLE_STATES = Object.freeze([
  "captured",
  "classified",
  "indexed",
  "summarized",
  "archived",
]);

export const DEFAULT_RETENTION_DAYS = 365;

export const MEMORY_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  autonomousMutationForbidden: true,
});

export const MEMORY_ENGINE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "knowledge.graph", implemented: false }),
  Object.freeze({ id: "consulting.engine", implemented: false }),
  Object.freeze({ id: "decision.engine", implemented: false }),
  Object.freeze({ id: "evolution.engine", implemented: false }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default ENTERPRISE_MEMORY_ENGINE_VERSION;
