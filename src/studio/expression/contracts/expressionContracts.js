/** Studio Expression Engine — official contracts (Program 2.3.2) */

export const STUDIO_EXPRESSION_VERSION = "mak-studio-expression-v1";

export const EXPRESSION_DOCUMENT_VERSION = "mak-expression-document-v1";

export const EXPRESSION_AST_VERSION = "mak-expression-ast-v1";

export const EXPRESSION_IR_VERSION = "mak-expression-ir-v1";

export const OFFICIAL_EXPRESSION_ENGINES = Object.freeze([
  "document",
  "ast",
  "parser",
  "compiler",
  "validator",
  "typeSystem",
  "functionCatalog",
  "context",
  "dependencyGraph",
  "refactoring",
]);

/** Supported AST node kinds — single official AST */
export const EXPRESSION_NODE_KINDS = Object.freeze([
  "Literal",
  "Variable",
  "PropertyAccess",
  "UnaryExpression",
  "BinaryExpression",
  "CallExpression",
  "NullCoalesce",
]);

/** Primitive expression types */
export const EXPRESSION_PRIMITIVE_TYPES = Object.freeze([
  "number",
  "string",
  "boolean",
  "null",
  "unknown",
  "any",
]);

export default STUDIO_EXPRESSION_VERSION;
