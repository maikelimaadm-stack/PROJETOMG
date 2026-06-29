import { EXPRESSION_IR_VERSION } from "../contracts/expressionContracts.js";

/** Expression Compiler — AST → portable IR (Program 2.3.2) */

function compileNode(node, ops) {
  if (!node) return;
  switch (node.kind) {
    case "Literal":
      ops.push({ op: "literal", value: node.value, valueType: node.valueType });
      break;
    case "Variable":
      ops.push({ op: "var", name: node.name });
      break;
    case "PropertyAccess":
      compileNode(node.object, ops);
      ops.push({ op: "prop", property: node.property });
      break;
    case "UnaryExpression":
      compileNode(node.argument, ops);
      ops.push({ op: "unary", operator: node.operator });
      break;
    case "BinaryExpression":
      compileNode(node.left, ops);
      compileNode(node.right, ops);
      ops.push({ op: "binary", operator: node.operator });
      break;
    case "NullCoalesce":
      compileNode(node.left, ops);
      compileNode(node.right, ops);
      ops.push({ op: "nullCoalesce" });
      break;
    case "CallExpression":
      node.arguments.forEach((arg) => compileNode(arg, ops));
      ops.push({ op: "call", callee: node.callee, argc: node.arguments.length });
      break;
    default:
      ops.push({ op: "unknown", kind: node.kind });
  }
}

export function createExpressionCompiler() {
  return Object.freeze({
    compile(ast) {
      const ops = [];
      compileNode(ast?.expression, ops);
      return Object.freeze({
        irVersion: EXPRESSION_IR_VERSION,
        documentId: ast?.documentId ?? null,
        astVersion: ast?.astVersion,
        ops: Object.freeze(ops),
        metadata: Object.freeze({
          expressionMetadata: ast?.metadata ?? {},
        }),
      });
    },
  });
}

export default createExpressionCompiler;
