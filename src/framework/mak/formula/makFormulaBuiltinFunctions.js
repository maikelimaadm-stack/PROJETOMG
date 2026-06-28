/**
 * Funções builtin da Formula Configuration Engine — metadata-driven.
 */

const toNumber = (value) => {
  if (value == null || value === "") return 0;
  const parsed = Number(String(value).replace(",", "."));
  return Number.isFinite(parsed) ? parsed : 0;
};

const toString = (value) => (value == null ? "" : String(value));

const parseDate = (value) => {
  if (!value) return null;
  const raw = String(value).split("T")[0];
  const date = new Date(raw);
  return Number.isNaN(date.getTime()) ? null : date;
};

export const MAK_FORMULA_FUNCTION_NAMES = Object.freeze([
  "sum",
  "avg",
  "min",
  "max",
  "count",
  "multiply",
  "add",
  "subtract",
  "divide",
  "round",
  "ceil",
  "floor",
  "abs",
  "concat",
  "uppercase",
  "lowercase",
  "trim",
  "coalesce",
  "nullIf",
  "if",
  "case",
  "today",
  "now",
  "dateDiff",
  "dateAdd",
  "replace",
  "substring",
  "cast",
  "percent",
]);

export function resolveMakFormulaArg(arg, scope, evaluate) {
  if (arg == null) return arg;
  if (typeof arg === "number" || typeof arg === "boolean") return arg;
  if (typeof arg === "string") {
    if (Object.prototype.hasOwnProperty.call(scope, arg)) return scope[arg];
    if (/^-?\d+(?:[.,]\d+)?$/.test(arg.trim())) return toNumber(arg);
    return arg;
  }
  if (typeof arg === "object" && arg.fn) return evaluate(arg, scope);
  return arg;
}

export function evaluateMakFormulaNode(node, scope, evaluate = evaluateMakFormulaNode) {
  if (node == null) return null;
  if (typeof node === "number" || typeof node === "boolean") return node;
  if (typeof node === "string") return resolveMakFormulaArg(node, scope, evaluate);

  const fn = String(node.fn || node.function || node.type || "").toLowerCase();
  const args = (node.args || node.arguments || []).map((arg) => resolveMakFormulaArg(arg, scope, evaluate));

  switch (fn) {
    case "sum":
      return args.reduce((acc, value) => acc + toNumber(value), 0);
    case "avg": {
      const nums = args.map(toNumber);
      return nums.length ? nums.reduce((a, b) => a + b, 0) / nums.length : 0;
    }
    case "min":
      return Math.min(...args.map(toNumber));
    case "max":
      return Math.max(...args.map(toNumber));
    case "count":
      return args.filter((value) => value != null && value !== "").length;
    case "multiply":
      return args.reduce((acc, value) => acc * toNumber(value), args.length ? 1 : 0);
    case "add":
      return args.reduce((acc, value) => acc + toNumber(value), 0);
    case "subtract":
      return toNumber(args[0]) - toNumber(args[1]);
    case "divide": {
      const divisor = toNumber(args[1]);
      return divisor === 0 ? 0 : toNumber(args[0]) / divisor;
    }
    case "round":
      return Math.round(toNumber(args[0]) * 10 ** toNumber(args[1] ?? 0)) / 10 ** toNumber(args[1] ?? 0);
    case "ceil":
      return Math.ceil(toNumber(args[0]));
    case "floor":
      return Math.floor(toNumber(args[0]));
    case "abs":
      return Math.abs(toNumber(args[0]));
    case "concat":
      return args.map(toString).join("");
    case "uppercase":
      return toString(args[0]).toUpperCase();
    case "lowercase":
      return toString(args[0]).toLowerCase();
    case "trim":
      return toString(args[0]).trim();
    case "coalesce":
      return args.find((value) => value != null && value !== "") ?? null;
    case "nullif":
      return toString(args[0]) === toString(args[1]) ? null : args[0];
    case "if":
      return args[0] ? args[1] : args[2];
    case "case": {
      for (let i = 0; i < args.length - 1; i += 2) {
        if (args[i]) return args[i + 1];
      }
      return args.length % 2 === 1 ? args[args.length - 1] : null;
    }
    case "today":
      return new Date().toISOString().split("T")[0];
    case "now":
      return new Date().toISOString();
    case "datediff": {
      const start = parseDate(args[0]);
      const end = parseDate(args[1]);
      if (!start || !end) return 0;
      const unit = String(args[2] || "days").toLowerCase();
      const diffMs = end.getTime() - start.getTime();
      if (unit === "hours") return Math.floor(diffMs / 3600000);
      return Math.floor(diffMs / 86400000);
    }
    case "dateadd": {
      const base = parseDate(args[0]);
      if (!base) return null;
      const amount = toNumber(args[1]);
      const unit = String(args[2] || "days").toLowerCase();
      const next = new Date(base);
      if (unit === "hours") next.setHours(next.getHours() + amount);
      else next.setDate(next.getDate() + amount);
      return next.toISOString().split("T")[0];
    }
    case "replace":
      return toString(args[0]).replaceAll(toString(args[1]), toString(args[2]));
    case "substring":
      return toString(args[0]).substring(toNumber(args[1]), args[2] != null ? toNumber(args[2]) : undefined);
    case "cast":
      return args[1] === "number" ? toNumber(args[0]) : toString(args[0]);
    case "percent": {
      const part = toNumber(args[0]);
      const whole = toNumber(args[1]);
      return whole === 0 ? 0 : (part / whole) * 100;
    }
    default:
      return null;
  }
}

const OPERATORS = { "+": 1, "-": 1, "*": 2, "/": 2 };

export function evaluateMakFormulaExpression(expression, scope = {}) {
  if (expression == null || expression === "") return null;
  if (typeof expression === "object") return evaluateMakFormulaNode(expression, scope);
  const tokens =
    String(expression).match(/[a-zA-Z_][a-zA-Z0-9_]*|\d+(?:[.,]\d+)?|[()+\-*/]/g) || [];
  const output = [];
  const stack = [];

  tokens.forEach((token) => {
    if (/^\d/.test(token)) return output.push(toNumber(token));
    if (/^[a-zA-Z_]/.test(token)) return output.push(toNumber(scope[token] ?? 0));
    if (token === "(") return stack.push(token);
    if (token === ")") {
      while (stack.length && stack[stack.length - 1] !== "(") output.push(stack.pop());
      stack.pop();
      return;
    }
    if (OPERATORS[token]) {
      while (stack.length && OPERATORS[stack[stack.length - 1]] >= OPERATORS[token]) {
        output.push(stack.pop());
      }
      stack.push(token);
    }
  });

  while (stack.length) output.push(stack.pop());
  const values = [];
  output.forEach((token) => {
    if (typeof token === "number") return values.push(token);
    const b = values.pop() ?? 0;
    const a = values.pop() ?? 0;
    if (token === "+") values.push(a + b);
    if (token === "-") values.push(a - b);
    if (token === "*") values.push(a * b);
    if (token === "/") values.push(b === 0 ? 0 : a / b);
  });
  return values[0] ?? null;
}

export function normalizeMakFormulaDefinition(source = {}) {
  if (typeof source === "string") return { expression: source };
  if (source.expression != null) return { ...source };
  if (source.compute != null) return { expression: source.compute, ...source };
  if (source.formula != null) return normalizeMakFormulaDefinition(source.formula);
  if (source.fn) return { expression: source, ...source };
  return { ...source };
}

export function extractMakFormulaDependencies(formulaDef = {}, fieldName = "") {
  const normalized = normalizeMakFormulaDefinition(formulaDef);
  if (Array.isArray(normalized.dependsOn)) return normalized.dependsOn;
  if (Array.isArray(normalized.watch)) return normalized.watch;

  const deps = new Set();
  const walk = (value) => {
    if (value == null) return;
    if (typeof value === "string" && /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(value)) {
      deps.add(value);
      return;
    }
    if (Array.isArray(value)) {
      value.forEach(walk);
      return;
    }
    if (typeof value === "object") {
      Object.values(value).forEach(walk);
    }
  };

  walk(normalized.expression);
  deps.delete(fieldName);
  return [...deps];
}

export default {
  MAK_FORMULA_FUNCTION_NAMES,
  evaluateMakFormulaNode,
  evaluateMakFormulaExpression,
  normalizeMakFormulaDefinition,
  extractMakFormulaDependencies,
};
