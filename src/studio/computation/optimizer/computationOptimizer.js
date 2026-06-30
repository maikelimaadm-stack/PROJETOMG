/** Computation Optimizer — compile-time passes (Program 3.1) */

const OPTIMIZER_PASSES = Object.freeze([
  "constantFold",
  "deadKernelElimination",
  "commonSubexpressionElimination",
  "aggregatePushdown",
  "cacheKeyNormalization",
  "parallelLayerTagging",
]);

export function createComputationOptimizer() {
  return Object.freeze({
    passes: OPTIMIZER_PASSES,
    optimize(irNodes, executionGraph) {
      const optimized = new Map(irNodes);
      optimized.forEach((ir, key) => {
        optimized.set(key, Object.freeze({
          ...ir,
          cacheKeyTemplate: ir.cacheKeyTemplate ?? `{tenant}:{module}:{kernel}:${ir.ownerFieldId}`,
          payload: Object.freeze({
            ...ir.payload,
            optimized: true,
            passesApplied: ["cacheKeyNormalization"],
          }),
        }));
      });
      return Object.freeze({
        irNodes: optimized,
        executionGraph,
        metadata: Object.freeze({
          passesApplied: ["cacheKeyNormalization"],
          optimizationHints: ["Lightweight compile-time normalization applied."],
        }),
      });
    },
    runPass(passName, irNodes) {
      if (!OPTIMIZER_PASSES.includes(passName)) {
        return { ok: false, irNodes, message: `Unknown pass: ${passName}` };
      }
      return { ok: true, irNodes, passName };
    },
  });
}

export default createComputationOptimizer;
