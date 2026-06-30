import { buildEvaluationMetadata } from "../metadata/evaluationMetadata.js";

/** Evaluation Result — official result model (Program 2.3.5) */

export function createEvaluationResult(partial = {}) {
  return Object.freeze({
    ok: partial.ok ?? false,
    value: partial.value ?? null,
    inferredType: partial.inferredType ?? "unknown",
    ownerId: partial.ownerId ?? null,
    strategy: partial.strategy ?? "eager",
    cached: partial.cached ?? false,
    diagnostics: Object.freeze(partial.diagnostics ?? []),
    metadata: buildEvaluationMetadata({
      executionCost: partial.metadata?.executionCost ?? 1,
      executionOrder: partial.metadata?.executionOrder ?? 0,
      cacheable: partial.metadata?.cacheable ?? true,
      parallelizable: partial.metadata?.parallelizable ?? false,
      optimizationHints: partial.metadata?.optimizationHints ?? [],
      aiHints: partial.metadata?.aiHints ?? [],
    }),
  });
}

export default createEvaluationResult;
