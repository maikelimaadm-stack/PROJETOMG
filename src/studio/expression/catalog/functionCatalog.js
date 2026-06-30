/**
 * Expression Function Catalog — centralized with AI/Marketplace metadata (Program 2.3.2)
 */

export const EXPRESSION_FUNCTION_CATALOG_VERSION = "mak-expression-function-catalog-v1";

/** @typedef {object} ExpressionFunctionDef
 * @property {string} name
 * @property {string} returnType
 * @property {Array<{ name: string, type: string, description?: string, aiHints?: string[] }>} arguments
 * @property {string} documentation
 * @property {string[]} examples
 * @property {string[]} aiHints
 * @property {boolean} [custom] — future custom functions
 */

export const OFFICIAL_EXPRESSION_FUNCTIONS = Object.freeze([
  {
    name: "abs",
    returnType: "number",
    arguments: [{ name: "value", type: "number", description: "Numeric value", aiHints: ["Use for absolute differences"] }],
    documentation: "Returns the absolute value of a number.",
    examples: ["abs(-5)", "abs(price - cost)"],
    aiHints: ["Prefer abs for magnitude without sign"],
  },
  {
    name: "min",
    returnType: "number",
    arguments: [
      { name: "a", type: "number" },
      { name: "b", type: "number" },
    ],
    documentation: "Returns the smaller of two numbers.",
    examples: ["min(a, b)", "min(total, limit)"],
    aiHints: ["Use to cap values from below"],
  },
  {
    name: "max",
    returnType: "number",
    arguments: [
      { name: "a", type: "number" },
      { name: "b", type: "number" },
    ],
    documentation: "Returns the larger of two numbers.",
    examples: ["max(a, b)", "max(score, 0)"],
    aiHints: ["Use to enforce minimum thresholds"],
  },
  {
    name: "concat",
    returnType: "string",
    arguments: [
      { name: "a", type: "string" },
      { name: "b", type: "string" },
    ],
    documentation: "Concatenates two strings.",
    examples: ['concat(firstName, " ")', "concat(city, state)"],
    aiHints: ["Use for label composition"],
  },
  {
    name: "isNull",
    returnType: "boolean",
    arguments: [{ name: "value", type: "any", description: "Value to test" }],
    documentation: "Returns true when value is null.",
    examples: ["isNull(field)", "isNull(notes) ?? defaultNote"],
    aiHints: ["Prefer null coalescing (??) when a fallback exists"],
  },
  {
    name: "coalesce",
    returnType: "any",
    arguments: [
      { name: "primary", type: "any" },
      { name: "fallback", type: "any" },
    ],
    documentation: "Returns primary unless null, then fallback.",
    examples: ["coalesce(nickname, name)", "coalesce(discount, 0)"],
    aiHints: ["Equivalent to (a ?? b) syntax"],
  },
]);

const fnByName = new Map(OFFICIAL_EXPRESSION_FUNCTIONS.map((f) => [f.name, f]));
const customFunctions = new Map();

export function createFunctionCatalog() {
  return Object.freeze({
    version: EXPRESSION_FUNCTION_CATALOG_VERSION,
    get(name) {
      return fnByName.get(name) ?? customFunctions.get(name) ?? null;
    },
    list() {
      return [...OFFICIAL_EXPRESSION_FUNCTIONS, ...customFunctions.values()];
    },
    registerCustom(def) {
      if (!def?.name) throw new Error("Function name is required.");
      customFunctions.set(def.name, Object.freeze({ ...def, custom: true }));
      return def.name;
    },
    has(name) {
      return fnByName.has(name) || customFunctions.has(name);
    },
  });
}

export function getOfficialFunctionCatalog() {
  return createFunctionCatalog();
}

export default OFFICIAL_EXPRESSION_FUNCTIONS;
