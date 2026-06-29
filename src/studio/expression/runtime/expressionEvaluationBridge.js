/**
 * Expression evaluation bridge — delegates to Studio Evaluation Engine (Program 2.3.5)
 */
import { createEvaluationEngine } from "../../evaluation/createEvaluationEngine.js";

export function createExpressionEvaluationBridge(options = {}) {
  const evaluationEngine = options.evaluationEngine ?? createEvaluationEngine({
    functionCatalog: options.functionCatalog,
  });

  return Object.freeze({
    engine: evaluationEngine,
    evaluateExpression(ast, expressionContext, partial = {}) {
      return evaluationEngine.evaluateExpression({
        ast,
        expressionContext,
        ownerId: partial.ownerId ?? "expression",
        strategy: partial.strategy ?? "eager",
        skipCache: partial.skipCache ?? false,
      });
    },
    evaluateSync(ast, expressionContext, partial = {}) {
      const result = evaluationEngine.evaluateExpression({
        ast,
        expressionContext,
        ownerId: partial.ownerId ?? "expression-sync",
        strategy: "eager",
        skipCache: true,
      });
      if (!result?.ok) return null;
      return result.value;
    },
  });
}

export default createExpressionEvaluationBridge;
