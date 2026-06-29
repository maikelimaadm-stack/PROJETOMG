/** Expression Validator — structural + type validation (Program 2.3.2) */

export function createExpressionValidator(typeSystem, functionCatalog) {
  const visit = (node, issues, context) => {
    if (!node) return;
    switch (node.kind) {
      case "Variable":
        if (!node.name) {
          issues.push({ severity: "error", code: "EXPR_VAR_NAME", message: "Variable name is required." });
        } else if (context?.listVariables && context.listVariables().length && !context.listVariables().includes(node.name)) {
          issues.push({
            severity: "warning",
            code: "EXPR_UNKNOWN_VAR",
            message: `Unknown variable '${node.name}'.`,
          });
        }
        break;
      case "CallExpression":
        if (!functionCatalog.has(node.callee)) {
          issues.push({
            severity: "error",
            code: "EXPR_UNKNOWN_FN",
            message: `Unknown function '${node.callee}'.`,
          });
        } else {
          const def = functionCatalog.get(node.callee);
          if (def.arguments?.length != null && node.arguments.length !== def.arguments.length) {
            issues.push({
              severity: "error",
              code: "EXPR_FN_ARGS",
              message: `Function '${node.callee}' expects ${def.arguments.length} argument(s).`,
            });
          }
        }
        node.arguments.forEach((arg) => visit(arg, issues, context));
        break;
      case "UnaryExpression":
        visit(node.argument, issues, context);
        break;
      case "BinaryExpression":
        visit(node.left, issues, context);
        visit(node.right, issues, context);
        break;
      case "NullCoalesce":
        visit(node.left, issues, context);
        visit(node.right, issues, context);
        break;
      case "PropertyAccess":
        visit(node.object, issues, context);
        if (!node.property) {
          issues.push({ severity: "error", code: "EXPR_PROP", message: "Property name is required." });
        }
        break;
      default:
        break;
    }
  };

  return Object.freeze({
    validate(ast, context) {
      const issues = [];
      visit(ast?.expression, issues, context);
      const inferredType = typeSystem.infer(ast?.expression, context);
      const errors = issues.filter((i) => i.severity === "error");
      return Object.freeze({
        valid: errors.length === 0,
        ok: errors.length === 0,
        inferredType,
        issues,
        errors,
        warnings: issues.filter((i) => i.severity === "warning"),
      });
    },
  });
}

export default createExpressionValidator;
