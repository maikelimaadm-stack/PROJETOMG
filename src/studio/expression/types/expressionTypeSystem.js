import { EXPRESSION_PRIMITIVE_TYPES } from "../contracts/expressionContracts.js";

/** Expression Type System — structural inference (Program 2.3.2) */

const BINARY_RESULT = Object.freeze({
  "+": { number_number: "number", string_string: "string", any_any: "unknown" },
  "-": { number_number: "number" },
  "*": { number_number: "number" },
  "/": { number_number: "number" },
  "%": { number_number: "number" },
  "==": { any_any: "boolean" },
  "!=": { any_any: "boolean" },
  "<": { number_number: "boolean", string_string: "boolean" },
  ">": { number_number: "boolean", string_string: "boolean" },
  "<=": { number_number: "boolean", string_string: "boolean" },
  ">=": { number_number: "boolean", string_string: "boolean" },
  "&&": { boolean_boolean: "boolean" },
  "||": { boolean_boolean: "boolean" },
});

export function createExpressionTypeSystem(functionCatalog) {
  const resolveKey = (left, right) => `${left}_${right}`;

  const inferLiteral = (node) => node.valueType ?? "unknown";

  const inferNode = (node, context) => {
    if (!node) return "unknown";
    switch (node.kind) {
      case "Literal":
        return inferLiteral(node);
      case "Variable": {
        const declared = context?.getVariableType?.(node.name);
        return declared ?? "unknown";
      }
      case "PropertyAccess":
        return context?.getPropertyType?.(node) ?? "unknown";
      case "UnaryExpression":
        if (node.operator === "!") return "boolean";
        if (node.operator === "-") return inferNode(node.argument, context);
        return "unknown";
      case "BinaryExpression": {
        const left = inferNode(node.left, context);
        const right = inferNode(node.right, context);
        const table = BINARY_RESULT[node.operator];
        if (!table) return "unknown";
        return table[resolveKey(left, right)] ?? table.any_any ?? "unknown";
      }
      case "NullCoalesce":
        return inferNode(node.right, context);
      case "CallExpression": {
        const fn = functionCatalog?.get?.(node.callee);
        return fn?.returnType ?? "unknown";
      }
      default:
        return "unknown";
    }
  };

  return Object.freeze({
    infer(node, context) {
      return inferNode(node, context);
    },
    isValidType(type) {
      return EXPRESSION_PRIMITIVE_TYPES.includes(type) || type.endsWith("[]");
    },
    coerceCompatible(left, right) {
      if (left === right) return true;
      if (left === "any" || right === "any" || left === "unknown" || right === "unknown") return true;
      return false;
    },
  });
}

export default createExpressionTypeSystem;
