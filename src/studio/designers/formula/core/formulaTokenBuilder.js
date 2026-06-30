/** Visual token insertion — builds expressionSource string only; parse via Computation Engine */

export function insertFormulaToken(expressionSource, token) {
  const base = expressionSource ?? "";
  const needsSpace = base.length > 0 && !/\s$/.test(base) && token.kind !== "paren";
  const prefix = needsSpace ? `${base} ` : base;

  switch (token.kind) {
    case "field":
      return `${prefix}${token.name}`;
    case "function":
      return `${prefix}${token.name}(`;
    case "operator":
      return `${prefix}${token.op}`;
    case "constant":
      return `${prefix}${formatConstant(token.value)}`;
    case "paren":
      return `${prefix}${token.value}`;
    default:
      return prefix;
  }
}

function formatConstant(value) {
  if (typeof value === "string") return `"${value.replace(/"/g, '\\"')}"`;
  if (value === null) return "null";
  return String(value);
}

export function createFormulaToken(kind, partial = {}) {
  return Object.freeze({ kind, ...partial });
}

export default insertFormulaToken;
