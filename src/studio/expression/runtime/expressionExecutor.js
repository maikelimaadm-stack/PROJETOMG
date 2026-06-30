/**
 * Expression executor re-export — backward compat (Program 2.3.5)
 * Execution must go through Studio Evaluation Engine in new code.
 */
import { executeExpressionAst } from "../../evaluation/runners/expressionAstRunner.js";

export { executeExpressionAst };
export default executeExpressionAst;
