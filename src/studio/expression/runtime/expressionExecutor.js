/**
 * Minimal expression executor — foundation only (Program 2.3.2)
 * Not a production runtime; structural evaluation for literals and simple ops.
 */
import { getOfficialFunctionCatalog } from "../catalog/functionCatalog.js";

const BUILTIN_IMPL = Object.freeze({
  abs: (args) => Math.abs(Number(args[0] ?? 0)),
  min: (args) => Math.min(Number(args[0] ?? 0), Number(args[1] ?? 0)),
  max: (args) => Math.max(Number(args[0] ?? 0), Number(args[1] ?? 0)),
  concat: (args) => String(args[0] ?? "") + String(args[1] ?? ""),
  isNull: (args) => args[0] == null,
  coalesce: (args) => (args[0] == null ? args[1] : args[0]),
});

export function executeExpressionAst(ast, context, functionCatalog = getOfficialFunctionCatalog()) {
  const evalNode = (node) => {
    switch (node.kind) {
      case "Literal":
        return node.value;
      case "Variable": {
        const v = context?.getVariable?.(node.name);
        return v !== undefined ? v : null;
      }
      case "PropertyAccess": {
        const base = evalNode(node.object);
        if (base == null || typeof base !== "object") return null;
        return base[node.property] ?? null;
      }
      case "UnaryExpression":
        if (node.operator === "!") return !evalNode(node.argument);
        if (node.operator === "-") return -Number(evalNode(node.argument));
        return null;
      case "BinaryExpression": {
        const l = evalNode(node.left);
        const r = evalNode(node.right);
        switch (node.operator) {
          case "+":
            return typeof l === "string" || typeof r === "string" ? String(l ?? "") + String(r ?? "") : Number(l) + Number(r);
          case "-":
            return Number(l) - Number(r);
          case "*":
            return Number(l) * Number(r);
          case "/":
            return Number(l) / Number(r);
          case "%":
            return Number(l) % Number(r);
          case "==":
            return l == r;
          case "!=":
            return l != r;
          case "<":
            return l < r;
          case ">":
            return l > r;
          case "<=":
            return l <= r;
          case ">=":
            return l >= r;
          case "&&":
            return Boolean(l) && Boolean(r);
          case "||":
            return Boolean(l) || Boolean(r);
          default:
            return null;
        }
      }
      case "NullCoalesce": {
        const l = evalNode(node.left);
        return l == null ? evalNode(node.right) : l;
      }
      case "CallExpression": {
        const args = node.arguments.map(evalNode);
        const impl = BUILTIN_IMPL[node.callee];
        if (impl) return impl(args);
        if (!functionCatalog.has(node.callee)) throw new Error(`Unknown function: ${node.callee}`);
        return null;
      }
      default:
        return null;
    }
  };

  return evalNode(ast?.expression);
}

export default executeExpressionAst;
