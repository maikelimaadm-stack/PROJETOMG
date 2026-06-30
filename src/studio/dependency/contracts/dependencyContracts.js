/** Studio Dependency Engine — official contracts (Program 2.3.3) */

export const STUDIO_DEPENDENCY_VERSION = "mak-studio-dependency-v1";

export const DEPENDENCY_GRAPH_VERSION = "mak-studio-dependency-graph-v1";

export const OFFICIAL_DEPENDENCY_ENGINES = Object.freeze([
  "graph",
  "analyzer",
  "cycleDetection",
  "resolver",
  "cache",
  "invalidation",
  "impactAnalyzer",
  "safeRename",
  "safeDelete",
]);

/** Supported dependency node kinds — all Studio artifact types */
export const DEPENDENCY_NODE_KINDS = Object.freeze([
  "layout",
  "field",
  "expression",
  "relationship",
  "workflow",
  "dashboard",
  "report",
  "kpi",
  "automation",
  "ai",
  "marketplace_package",
  "base_template",
  "reference",
  "binding",
]);

export const DEPENDENCY_EDGE_KINDS = Object.freeze([
  "contains",
  "reference",
  "expression-ref",
  "expression",
  "binding",
  "business-type",
  "depends-on",
  "marketplace",
  "template",
]);

export default STUDIO_DEPENDENCY_VERSION;
