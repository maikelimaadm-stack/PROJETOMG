/** Extract variable references from Expression AST — no local graph (Program 2.3.3) */

export function extractVariableRefsFromAst(ast) {
  const deps = new Set();
  const walk = (node) => {
    if (!node) return;
    if (node.kind === "Variable") deps.add(node.name);
    if (node.kind === "PropertyAccess") walk(node.object);
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
  return Object.freeze([...deps]);
}

export default extractVariableRefsFromAst;
