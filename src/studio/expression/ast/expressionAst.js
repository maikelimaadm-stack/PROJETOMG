import { EXPRESSION_AST_VERSION, EXPRESSION_NODE_KINDS } from "../contracts/expressionContracts.js";

/** Official Expression AST — single AST for all Studios (Program 2.3.2) */

export function createAstNode(kind, partial = {}) {
  if (!EXPRESSION_NODE_KINDS.includes(kind)) {
    throw new Error(`Unknown expression AST node kind: ${kind}`);
  }
  return Object.freeze({
    astVersion: EXPRESSION_AST_VERSION,
    kind,
    ...partial,
  });
}

export function createLiteralNode(value, rawType = null) {
  const type =
    rawType ??
    (value === null ? "null" : typeof value === "number" ? "number" : typeof value === "boolean" ? "boolean" : "string");
  return createAstNode("Literal", { value, valueType: type });
}

export function createVariableNode(name) {
  return createAstNode("Variable", { name });
}

export function createPropertyAccessNode(object, property) {
  return createAstNode("PropertyAccess", { object, property });
}

export function createUnaryNode(operator, argument) {
  return createAstNode("UnaryExpression", { operator, argument });
}

export function createBinaryNode(operator, left, right) {
  return createAstNode("BinaryExpression", { operator, left, right });
}

export function createNullCoalesceNode(left, right) {
  return createAstNode("NullCoalesce", { left, right });
}

export function createCallNode(callee, args = []) {
  return createAstNode("CallExpression", { callee, arguments: args });
}

export function createExpressionAstRoot(expression, partial = {}) {
  return Object.freeze({
    astVersion: EXPRESSION_AST_VERSION,
    documentId: partial.documentId ?? null,
    expression,
    metadata: Object.freeze(partial.metadata ?? {}),
  });
}

export function validateExpressionAst(ast) {
  const errors = [];
  if (!ast?.astVersion) errors.push("astVersion is required.");
  if (!ast?.expression) errors.push("expression root is required.");
  return { valid: errors.length === 0, errors };
}

export default createExpressionAstRoot;
