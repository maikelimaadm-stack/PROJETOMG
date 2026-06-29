/** Layout AST — intermediate representation (Program 2.2) */

export const LAYOUT_AST_VERSION = "mak-layout-ast-v1";

/** @typedef {"layout"|"page"|"section"|"container"|"component"} LayoutAstNodeType */

/**
 * @typedef {object} LayoutAstNode
 * @property {string} nodeId
 * @property {LayoutAstNodeType} nodeType
 * @property {string} [refId]
 * @property {Record<string, unknown>} [attrs]
 * @property {LayoutAstNode[]} [children]
 */

/**
 * @typedef {object} LayoutAst
 * @property {string} astVersion
 * @property {string} documentId
 * @property {string} moduleId
 * @property {LayoutAstNode} root
 */

export function createLayoutAst(partial = {}) {
  return Object.freeze({
    astVersion: LAYOUT_AST_VERSION,
    documentId: partial.documentId ?? "layout.draft",
    moduleId: partial.moduleId ?? "empresas",
    root: Object.freeze(partial.root ?? { nodeId: "root", nodeType: "layout", children: [] }),
  });
}

export function validateLayoutAst(ast) {
  const errors = [];
  if (!ast?.astVersion) errors.push("astVersion is required.");
  if (!ast?.root?.nodeType) errors.push("root node is required.");
  return { valid: errors.length === 0, errors };
}

export default createLayoutAst;
