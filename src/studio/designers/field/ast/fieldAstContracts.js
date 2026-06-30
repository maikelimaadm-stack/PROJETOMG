/** Field AST contract — Program 2.3 */

export const FIELD_AST_VERSION = "mak-field-ast-v1";

export function createFieldAst(partial = {}) {
  return Object.freeze({
    astVersion: FIELD_AST_VERSION,
    documentId: partial.documentId ?? null,
    moduleId: partial.moduleId ?? "empresas",
    root: Object.freeze(partial.root ?? {}),
  });
}

export function validateFieldAst(ast) {
  const errors = [];
  if (!ast?.astVersion) errors.push("astVersion is required.");
  if (!ast?.root) errors.push("root is required.");
  return { valid: errors.length === 0, errors };
}

export default createFieldAst;
