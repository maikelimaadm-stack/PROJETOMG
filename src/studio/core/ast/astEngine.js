/** AST Engine — parser, transformer, compiler, visitors, serialization (Program 2.2.5) */

export const AST_ENGINE_VERSION = "mak-ast-engine-v1";

export function createAstEngine(options = {}) {
  const astVersion = options.astVersion ?? "mak-ast-v1";
  const transformers = new Map();
  const compilers = new Map();
  const visitors = new Map();

  const registerTransformer = (id, fn) => {
    transformers.set(id, fn);
    return id;
  };

  const registerCompiler = (id, fn) => {
    compilers.set(id, fn);
    return id;
  };

  const registerVisitor = (id, fn) => {
    visitors.set(id, fn);
    return id;
  };

  const parse = (document, transformerId = "default") => {
    const transformer = transformers.get(transformerId);
    if (!transformer) throw new Error(`AST transformer not found: ${transformerId}`);
    const root = transformer(document);
    return Object.freeze({
      astVersion,
      documentId: document.documentId ?? document.id ?? null,
      moduleId: document.moduleId ?? null,
      root: Object.freeze(root),
    });
  };

  const compile = (ast, compilerId = "default") => {
    const compiler = compilers.get(compilerId);
    if (!compiler) throw new Error(`AST compiler not found: ${compilerId}`);
    return compiler(ast);
  };

  const visit = (ast, visitorId = "default", context = {}) => {
    const visitor = visitors.get(visitorId);
    if (!visitor) throw new Error(`AST visitor not found: ${visitorId}`);
    const results = [];
    const walk = (node, depth = 0) => {
      results.push(visitor(node, { depth, ...context }));
      (node.children ?? []).forEach((child) => walk(child, depth + 1));
    };
    if (ast.root) walk(ast.root);
    return results;
  };

  const serialize = (ast) => JSON.stringify(ast);
  const deserialize = (json) => {
    const parsed = typeof json === "string" ? JSON.parse(json) : json;
    return Object.freeze(parsed);
  };

  const transform = (ast, transformerId) => {
    const transformer = transformers.get(transformerId);
    if (!transformer) throw new Error(`AST transformer not found: ${transformerId}`);
    return Object.freeze({ ...ast, root: Object.freeze(transformer({ __ast: ast.root })) });
  };

  return Object.freeze({
    version: AST_ENGINE_VERSION,
    astVersion,
    registerTransformer,
    registerCompiler,
    registerVisitor,
    parse,
    compile,
    visit,
    transform,
    serialize,
    deserialize,
  });
}

export default createAstEngine;
