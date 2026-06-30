import { EVALUATION_STRATEGIES } from "../contracts/evaluationContracts.js";

/** Evaluation Strategy — eager, lazy, batch, incremental (Program 2.3.5) */

export function createEvaluationStrategy() {
  return Object.freeze({
    strategies: EVALUATION_STRATEGIES,
    resolve(mode, itemCount = 1) {
      if (mode === "lazy") return "lazy";
      if (mode === "batch" || itemCount > 1) return "batch";
      if (mode === "incremental") return "incremental";
      return "eager";
    },
    describe(strategy) {
      const hints = {
        eager: ["Evaluate immediately on request."],
        lazy: ["Defer evaluation until value is read."],
        batch: ["Evaluate multiple items in dependency order."],
        incremental: ["Re-evaluate only changed dependency subgraph."],
      };
      return Object.freeze({
        strategy,
        optimizationHints: Object.freeze(hints[strategy] ?? []),
        parallelizable: strategy === "batch",
        cacheable: strategy !== "lazy",
      });
    },
  });
}

export default createEvaluationStrategy;
