/** Official Intelligence Foundation contracts — Program 3.11, D-077 */

export const ENTERPRISE_INTELLIGENCE_VERSION = "mak-enterprise-intelligence-v1";
export const DOMAIN_EVENT_BUS_VERSION = "mak-domain-event-bus-v1";
export const BUSINESS_MEMORY_FOUNDATION_VERSION = "mak-business-memory-foundation-v1";
export const BUSINESS_EVENT_ENVELOPE_VERSION = "mak-business-event-envelope-v1";

export const INTELLIGENCE_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  observationalOnly: true,
});

/** Business event taxonomy — tenant-scoped domain events (D-074 §10) */
export const BUSINESS_EVENT_CATEGORIES = Object.freeze({
  BOS: "bos.operation",
  WORKFLOW: "workflow.operation",
  INTENT: "intent.operation",
  ASSET: "business.asset",
  APPROVAL: "approval.decision",
  HEALTH: "business.health",
  OBSERVATION: "observation.signal",
  IMPROVEMENT: "improvement.opportunity",
  DECISION: "human.decision",
  OUTCOME: "business.outcome",
});

export const BUSINESS_EVENT_TYPES = Object.freeze({
  BOS_HOME_VIEWED: "bos.home.viewed",
  BOS_ASSET_CREATED: "bos.asset.created",
  BOS_USER_CONFIRMATION: "bos.user.confirmation",
  WORKFLOW_TASK_CREATED: "workflow.task.created",
  WORKFLOW_ACTION_APPROVE: "workflow.action.approve",
  WORKFLOW_ACTION_REJECT: "workflow.action.reject",
  WORKFLOW_ACTION_RETURN: "workflow.action.return",
  WORKFLOW_ACTION_ESCALATE: "workflow.action.escalate",
  WORKFLOW_OUTCOME_COMPLETED: "workflow.outcome.completed",
  INTENT_RESOLVED: "intent.resolved",
  INTENT_PREVIEW: "intent.preview",
  INTENT_OUTCOME_SUCCESS: "intent.outcome.success",
  INTENT_OUTCOME_FAILED: "intent.outcome.failed",
  DECISION_HUMAN: "decision.human",
  HEALTH_SIGNAL: "health.signal",
  PATTERN_DETECTED: "pattern.detected",
  IMPROVEMENT_SUGGESTED: "improvement.suggested",
});

export const MEMORY_RECORD_TYPES = Object.freeze({
  ENTERPRISE: "enterprise.memory",
  BUSINESS: "business.memory",
  OPERATIONAL: "operational.memory",
  DECISION: "decision.memory",
  WORKFLOW: "workflow.memory",
  INTENT: "intent.memory",
  OUTCOME: "outcome.memory",
});

export const INTELLIGENCE_EXTENSION_POINTS = Object.freeze([
  Object.freeze({
    id: "consulting.engine",
    label: "Consulting Engine",
    implemented: false,
    consumes: ["observation", "health", "improvement"],
  }),
  Object.freeze({
    id: "decision.engine",
    label: "Decision Engine",
    implemented: false,
    consumes: ["decision", "outcome", "lineage"],
  }),
  Object.freeze({
    id: "knowledge.graph",
    label: "Knowledge Graph",
    implemented: false,
    consumes: ["memory", "lineage", "knowledge_seeds"],
  }),
  Object.freeze({
    id: "evolution.engine",
    label: "Evolution Engine",
    implemented: false,
    consumes: ["telemetry", "pattern", "improvement"],
  }),
  Object.freeze({
    id: "ai.chat.assistant",
    label: "AI Chat Assistant",
    implemented: false,
    forbiddenForBusinessUser: true,
  }),
]);

export default ENTERPRISE_INTELLIGENCE_VERSION;
