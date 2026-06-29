/** Evaluation metadata — AI / Marketplace / Runtime ready (Program 2.3.5) */

export function buildEvaluationMetadata(partial = {}) {
  return Object.freeze({
    executionCost: partial.executionCost ?? 1,
    executionOrder: partial.executionOrder ?? 0,
    cacheable: partial.cacheable ?? true,
    parallelizable: partial.parallelizable ?? false,
    optimizationHints: Object.freeze(partial.optimizationHints ?? []),
    aiHints: Object.freeze(partial.aiHints ?? []),
    diagnostics: Object.freeze(partial.diagnostics ?? []),
    profiling: partial.profiling ?? null,
    runtimeHint: partial.runtimeHint ?? "Use dependency-ordered batch for computed fields.",
  });
}

export default buildEvaluationMetadata;
