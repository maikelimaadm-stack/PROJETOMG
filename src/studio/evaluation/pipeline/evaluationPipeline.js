import { createEvaluationResult } from "../result/evaluationResult.js";
import { executeExpressionAst } from "../runners/expressionAstRunner.js";

/** Evaluation Pipeline — official execution pipeline (Program 2.3.5) */

export function createEvaluationPipeline(deps = {}) {
  const {
    typeSystem,
    cache,
    diagnostics,
    profiler,
    hooks,
    strategyEngine,
    functionCatalog,
  } = deps;

  const toExpressionContext = (evalContext) =>
    Object.freeze({
      getVariable: (name) => evalContext?.getVariable?.(name),
      getVariableType: (name) => evalContext?.getVariableType?.(name),
      listVariables: () => evalContext?.listVariables?.() ?? [],
    });

  const evaluateExpression = (request) => {
    const {
      ast,
      context,
      ownerId = "expression",
      expressionContext,
      strategy = "eager",
      skipCache = false,
    } = request;

    const ctx = expressionContext ?? toExpressionContext(context);
    const contextSnap = context?.snapshot?.() ?? { variables: {} };
    const span = profiler?.startSpan?.("evaluateExpression", ownerId);

    hooks?.runBefore?.({ ownerId, strategy, ast });

    if (!skipCache && cache) {
      const cached = cache.get(ownerId, contextSnap);
      if (cached) {
        diagnostics?.record?.({ code: "EVAL_CACHE_HIT", message: "Cache hit.", ownerId });
        span?.end?.({ cached: true });
        return createEvaluationResult({ ...cached, cached: true, ownerId, strategy });
      }
    }

    let value = null;
    let ok = true;
    let inferredType = "unknown";
    const diagList = [];

    try {
      value = executeExpressionAst(ast, ctx, functionCatalog);
      inferredType = typeSystem?.inferExpression?.(ast?.expression, ctx) ?? "unknown";

      const typeCheck = typeSystem?.validateValue?.(value, inferredType);
      if (typeCheck && !typeCheck.valid) {
        typeCheck.issues?.forEach((issue) => {
          diagnostics?.record?.({ ...issue, ownerId, severity: issue.severity ?? "warning" });
          diagList.push(issue);
        });
      }
    } catch (err) {
      ok = false;
      diagnostics?.record?.({
        code: "EVAL_ERROR",
        severity: "error",
        message: err?.message ?? "Evaluation failed.",
        ownerId,
      });
      hooks?.runError?.({ ownerId, error: err });
    }

    const strategyMeta = strategyEngine?.describe?.(strategy) ?? {};
    const result = createEvaluationResult({
      ok,
      value,
      inferredType,
      ownerId,
      strategy,
      diagnostics: diagList,
      metadata: {
        executionCost: 1,
        executionOrder: request.executionOrder ?? 0,
        cacheable: strategyMeta.cacheable ?? true,
        parallelizable: strategyMeta.parallelizable ?? false,
        optimizationHints: strategyMeta.optimizationHints ?? [],
        aiHints: ["Expression evaluated via official Evaluation Pipeline."],
        profiling: span?.end?.({ ok, inferredType }),
      },
    });

    if (ok && cache && result.metadata.cacheable && !skipCache) {
      cache.set(ownerId, contextSnap, result);
    }

    hooks?.runAfter?.({ ownerId, result });
    return result;
  };

  const evaluateBatch = (requests, graph, scheduler) => {
    const scheduled = scheduler?.schedule?.(requests, graph?.graph ?? graph) ?? requests;
    return Object.freeze(
      scheduled.map((req) => evaluateExpression({ ...req, executionOrder: req.executionOrder }))
    );
  };

  return Object.freeze({
    evaluateExpression,
    evaluateBatch,
  });
}

export default createEvaluationPipeline;
