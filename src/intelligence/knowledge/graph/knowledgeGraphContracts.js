/** Enterprise Knowledge Graph contracts — Program 3.13, D-079 */

export const ENTERPRISE_KNOWLEDGE_GRAPH_VERSION = "mak-enterprise-knowledge-graph-v1";
export const KNOWLEDGE_GRAPH_STORE_VERSION = "mak-knowledge-graph-store-v1";
export const KNOWLEDGE_NODE_SCHEMA_VERSION = "mak-knowledge-node-v1";
export const KNOWLEDGE_EDGE_SCHEMA_VERSION = "mak-knowledge-edge-v1";

export const KNOWLEDGE_GRAPH_TYPES = Object.freeze({
  ENTERPRISE: "enterprise.knowledge.graph",
  BUSINESS: "business.knowledge.graph",
});

export const KNOWLEDGE_NODE_KINDS = Object.freeze({
  ASSET: "knowledge.node.asset",
  WORKFLOW: "knowledge.node.workflow",
  INTENT: "knowledge.node.intent",
  DECISION: "knowledge.node.decision",
  OUTCOME: "knowledge.node.outcome",
  PROCESS: "knowledge.node.process",
  CAPABILITY: "knowledge.node.capability",
  MEMORY: "knowledge.node.memory",
  PATTERN: "knowledge.node.pattern",
  ENTITY: "knowledge.node.entity",
  HEALTH_SIGNAL: "knowledge.node.health_signal",
  IMPROVEMENT: "knowledge.node.improvement",
});

export const KNOWLEDGE_RELATIONSHIP_KINDS = Object.freeze({
  INTENT_ORIGINATES_ASSET: "intent.originates.asset",
  WORKFLOW_IMPACTS_OUTCOME: "workflow.impacts.outcome",
  DECISION_RESULTS_IN: "decision.results.in",
  ASSET_RELATES_ASSET: "asset.relates.to.asset",
  PROCESS_DEPENDS_CAPABILITY: "process.depends.on.capability",
  MEMORY_EVIDENCE_OUTCOME: "memory.evidence.for.outcome",
  WORKFLOW_USES_ASSET: "workflow.uses.asset",
  INTENT_DERIVES_WORKFLOW: "intent.derives.workflow",
  PATTERN_RECURS_OPERATION: "pattern.recurs.in.operation",
  DECISION_AFFECTS_WORKFLOW: "decision.affects.workflow",
  OUTCOME_FOLLOWS_DECISION: "outcome.follows.decision",
  HEALTH_SIGNALS_OPERATION: "health.signals.operation",
});

export const KNOWLEDGE_LIFECYCLE_STATES = Object.freeze([
  "indexed",
  "linked",
  "summarized",
  "archived",
]);

export const KNOWLEDGE_OWNERSHIP = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  tenantScoped: true,
  autonomousMutationForbidden: true,
});

export const KNOWLEDGE_GRAPH_EXTENSION_POINTS = Object.freeze([
  Object.freeze({ id: "consulting.engine", implemented: false, consumes: ["knowledge.graph"] }),
  Object.freeze({ id: "decision.engine", implemented: false, consumes: ["knowledge.graph"] }),
  Object.freeze({ id: "evolution.engine", implemented: false, consumes: ["knowledge.graph"] }),
  Object.freeze({ id: "ai.chat.assistant", implemented: false, forbiddenForBusinessUser: true }),
]);

export default ENTERPRISE_KNOWLEDGE_GRAPH_VERSION;
