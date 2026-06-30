/** Studio Computation Engine — official contracts (Program 3.1) */

export const STUDIO_COMPUTATION_VERSION = "mak-studio-computation-v1";

export const COMPUTATION_DOCUMENT_VERSION = "mak-computation-document-v1";

export const COMPUTATION_AST_VERSION = "mak-computation-ast-v1";

export const COMPUTATION_GRAPH_VERSION = "mak-computation-graph-v1";

export const EXECUTION_GRAPH_VERSION = "mak-execution-graph-v1";

export const COMPUTATION_IR_VERSION = "mak-computation-ir-v1";

export const OFFICIAL_COMPUTATION_ENGINES = Object.freeze([
  "document",
  "ast",
  "computationGraph",
  "executionGraph",
  "ir",
  "optimizer",
  "costAnalyzer",
  "validationPipeline",
  "context",
  "fieldModels",
]);

/** Supported computation AST node kinds — extends expression nodes */
export const COMPUTATION_NODE_KINDS = Object.freeze([
  "Literal",
  "Variable",
  "PropertyAccess",
  "UnaryExpression",
  "BinaryExpression",
  "CallExpression",
  "NullCoalesce",
  "FieldRef",
  "CrossEntityRef",
  "Sum",
  "Count",
  "Avg",
  "Min",
  "Max",
  "DistinctCount",
  "Rollup",
  "Lookup",
  "MapCollection",
  "FilterCollection",
  "ReduceCollection",
  "Coalesce",
  "If",
  "Switch",
  "Try",
]);

export const COMPUTATION_FIELD_KINDS = Object.freeze([
  "computed",
  "derived",
  "aggregation",
  "rollup",
  "lookup",
  "calculated_collection",
]);

export const COMPUTATION_OWNER_TYPES = Object.freeze(["field", "widget", "collection", "rollup"]);

export const EVALUATION_POLICIES = Object.freeze(["lazy", "eager", "batch", "incremental"]);

export const COST_TIERS = Object.freeze(["O(1)", "O(n)", "O(n log n)", "O cross-entity", "O prohibited"]);

export const COMPUTATION_ERROR_CODES = Object.freeze([
  "COMP_CYCLE",
  "COMP_TYPE_MISMATCH",
  "COMP_LOOKUP_UNRESOLVED",
  "COMP_AGGREGATE_TIMEOUT",
  "COMP_COST_EXCEEDED",
  "COMP_VERSION_DRIFT",
]);

export default STUDIO_COMPUTATION_VERSION;
