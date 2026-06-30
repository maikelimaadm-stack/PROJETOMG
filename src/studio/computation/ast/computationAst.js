import {
  COMPUTATION_AST_VERSION,
  COMPUTATION_NODE_KINDS,
} from "../contracts/computationContracts.js";
import { EXPRESSION_AST_VERSION, EXPRESSION_NODE_KINDS } from "../../expression/contracts/expressionContracts.js";

/** Computation AST — extends Expression AST (Program 3.1) */

const EXPRESSION_KINDS = new Set(EXPRESSION_NODE_KINDS);
const COMPUTATION_ONLY_KINDS = new Set(
  COMPUTATION_NODE_KINDS.filter((k) => !EXPRESSION_KINDS.has(k))
);

export function isExpressionNodeKind(kind) {
  return EXPRESSION_KINDS.has(kind);
}

export function isComputationNodeKind(kind) {
  return COMPUTATION_NODE_KINDS.includes(kind);
}

export function createComputationNode(kind, partial = {}) {
  if (!COMPUTATION_NODE_KINDS.includes(kind)) {
    throw new Error(`Unknown computation AST node kind: ${kind}`);
  }
  return Object.freeze({
    astVersion: isExpressionNodeKind(kind) ? EXPRESSION_AST_VERSION : COMPUTATION_AST_VERSION,
    kind,
    ...partial,
  });
}

export function createFieldRefNode(fieldId, partial = {}) {
  return createComputationNode("FieldRef", { fieldId, ...partial });
}

export function createCrossEntityRefNode(relationId, fieldId, partial = {}) {
  return createComputationNode("CrossEntityRef", { relationId, fieldId, ...partial });
}

export function createAggregateNode(kind, partial = {}) {
  const aggKinds = ["Sum", "Count", "Avg", "Min", "Max", "DistinctCount"];
  if (!aggKinds.includes(kind)) {
    throw new Error(`Unknown aggregate kind: ${kind}`);
  }
  return createComputationNode(kind, partial);
}

export function createRollupNode(parentField, childRelation, aggregate, partial = {}) {
  return createComputationNode("Rollup", { parentField, childRelation, aggregate, ...partial });
}

export function createLookupNode(relationId, matchKey, returnField, partial = {}) {
  return createComputationNode("Lookup", { relationId, matchKey, returnField, ...partial });
}

export function createComputationAstRoot(expression, partial = {}) {
  return Object.freeze({
    astVersion: COMPUTATION_AST_VERSION,
    documentId: partial.documentId ?? null,
    expression,
    metadata: Object.freeze(partial.metadata ?? {}),
  });
}

export function validateComputationAst(ast) {
  const errors = [];
  if (!ast?.astVersion) errors.push("astVersion is required.");
  if (ast?.astVersion && ast.astVersion !== COMPUTATION_AST_VERSION) {
    errors.push(`Invalid astVersion: ${ast.astVersion}`);
  }
  return { valid: errors.length === 0, errors };
}

export function walkComputationAst(node, visitor) {
  if (!node || typeof node !== "object") return;
  visitor(node);
  const childKeys = ["left", "right", "argument", "object", "expression", "aggregate", "matchKey", "returnField"];
  childKeys.forEach((key) => {
    if (node[key]) walkComputationAst(node[key], visitor);
  });
  if (Array.isArray(node.arguments)) node.arguments.forEach((arg) => walkComputationAst(arg, visitor));
  if (Array.isArray(node.items)) node.items.forEach((item) => walkComputationAst(item, visitor));
}

export { COMPUTATION_ONLY_KINDS };

export default createComputationAstRoot;
