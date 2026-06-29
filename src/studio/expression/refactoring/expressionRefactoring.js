/** Expression Refactoring — safe variable rename (Program 2.3.2) */

function renameInNode(node, from, to) {
  if (!node) return node;
  switch (node.kind) {
    case "Variable":
      return node.name === from ? { ...node, name: to } : node;
    case "PropertyAccess":
      return { ...node, object: renameInNode(node.object, from, to) };
    case "UnaryExpression":
      return { ...node, argument: renameInNode(node.argument, from, to) };
    case "BinaryExpression":
      return {
        ...node,
        left: renameInNode(node.left, from, to),
        right: renameInNode(node.right, from, to),
      };
    case "NullCoalesce":
      return {
        ...node,
        left: renameInNode(node.left, from, to),
        right: renameInNode(node.right, from, to),
      };
    case "CallExpression":
      return {
        ...node,
        arguments: node.arguments.map((arg) => renameInNode(arg, from, to)),
      };
    default:
      return node;
  }
}

export function createExpressionRefactoring() {
  return Object.freeze({
    renameVariable(ast, from, to) {
      if (!from || !to) throw new Error("renameVariable requires from and to names.");
      return Object.freeze({
        ...ast,
        expression: renameInNode(ast.expression, from, to),
      });
    },
  });
}

export default createExpressionRefactoring;
