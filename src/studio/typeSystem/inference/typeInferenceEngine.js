/** Type Inference Engine — official single implementation (Program 2.3.4) */

const BINARY_RESULT = Object.freeze({
  "+": { number_number: "decimal", integer_integer: "integer", decimal_decimal: "decimal", string_string: "string", any_any: "unknown" },
  "-": { number_number: "decimal", integer_integer: "integer", decimal_decimal: "decimal" },
  "*": { number_number: "decimal", integer_integer: "integer", decimal_decimal: "decimal" },
  "/": { number_number: "decimal", integer_integer: "integer", decimal_decimal: "decimal" },
  "%": { number_number: "decimal", integer_integer: "integer" },
  "==": { any_any: "boolean" },
  "!=": { any_any: "boolean" },
  "<": { number_number: "boolean", string_string: "boolean" },
  ">": { number_number: "boolean", string_string: "boolean" },
  "<=": { number_number: "boolean", string_string: "boolean" },
  ">=": { number_number: "boolean", string_string: "boolean" },
  "&&": { boolean_boolean: "boolean" },
  "||": { boolean_boolean: "boolean" },
});

export function createTypeInferenceEngine(registry, options = {}) {
  const functionCatalog = options.functionCatalog ?? null;
  const resolveKey = (left, right) => `${left}_${right}`;

  const normalizeNumeric = (typeId) => {
    if (typeId === "number") return "decimal";
    return typeId;
  };

  const inferLiteral = (node) => {
    const vt = node.valueType ?? "unknown";
    if (vt === "number") return "decimal";
    return vt;
  };

  const inferExpressionNode = (node, context) => {
    if (!node) return "unknown";
    switch (node.kind) {
      case "Literal":
        return inferLiteral(node);
      case "Variable": {
        const declared = context?.getVariableType?.(node.name);
        return normalizeNumeric(declared ?? "unknown");
      }
      case "PropertyAccess":
        return normalizeNumeric(context?.getPropertyType?.(node) ?? "unknown");
      case "UnaryExpression":
        if (node.operator === "!") return "boolean";
        if (node.operator === "-") return inferExpressionNode(node.argument, context);
        return "unknown";
      case "BinaryExpression": {
        const left = inferExpressionNode(node.left, context);
        const right = inferExpressionNode(node.right, context);
        const table = BINARY_RESULT[node.operator];
        if (!table) return "unknown";
        const lk = left === "decimal" || left === "integer" ? "number" : left;
        const rk = right === "decimal" || right === "integer" ? "number" : right;
        return table[resolveKey(lk, rk)] ?? table[`${left}_${right}`] ?? table.any_any ?? "unknown";
      }
      case "NullCoalesce":
        return inferExpressionNode(node.right, context);
      case "CallExpression": {
        const fn = functionCatalog?.get?.(node.callee);
        return normalizeNumeric(fn?.returnType ?? "unknown");
      }
      default:
        return "unknown";
    }
  };

  const inferFromValue = (value) => {
    if (value === null) return "null";
    if (Array.isArray(value)) return "collection";
    const t = typeof value;
    if (t === "string") return "string";
    if (t === "boolean") return "boolean";
    if (t === "number") return Number.isInteger(value) ? "integer" : "decimal";
    if (t === "object") return "object";
    return "unknown";
  };

  return Object.freeze({
    inferExpression: inferExpressionNode,
    inferFromValue,
    infer(nodeOrValue, context) {
      if (nodeOrValue && typeof nodeOrValue === "object" && nodeOrValue.kind) {
        return inferExpressionNode(nodeOrValue, context);
      }
      return inferFromValue(nodeOrValue);
    },
    inferFieldType(fieldType, businessTypeId = null) {
      return registry?.resolveFieldType?.(fieldType, businessTypeId) ?? "unknown";
    },
  });
}

export default createTypeInferenceEngine;
