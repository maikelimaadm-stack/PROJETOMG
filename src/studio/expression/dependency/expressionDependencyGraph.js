/** Expression Dependency Graph — variable references (Program 2.3.2) */

export function createExpressionDependencyGraph() {
  const nodes = new Map();
  const edges = [];

  return Object.freeze({
    clear() {
      nodes.clear();
      edges.length = 0;
    },
    extractFromAst(ast, ownerId = "expression") {
      const deps = new Set();
      const walk = (node) => {
        if (!node) return;
        if (node.kind === "Variable") deps.add(node.name);
        if (node.kind === "PropertyAccess") {
          walk(node.object);
        }
        if (node.kind === "UnaryExpression") walk(node.argument);
        if (node.kind === "BinaryExpression") {
          walk(node.left);
          walk(node.right);
        }
        if (node.kind === "NullCoalesce") {
          walk(node.left);
          walk(node.right);
        }
        if (node.kind === "CallExpression") node.arguments.forEach(walk);
      };
      walk(ast?.expression);
      nodes.set(ownerId, { id: ownerId, dependencies: [...deps] });
      deps.forEach((dep) => edges.push({ from: ownerId, to: dep, kind: "variable-ref" }));
      return [...deps];
    },
    getDependencies(ownerId) {
      return nodes.get(ownerId)?.dependencies ?? [];
    },
    snapshot() {
      return Object.freeze({
        nodes: Object.freeze([...nodes.values()]),
        edges: Object.freeze([...edges]),
      });
    },
  });
}

export default createExpressionDependencyGraph;
