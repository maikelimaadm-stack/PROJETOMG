import { upsertOptimizationBenchmark } from "./optimizationEngineStore.js";
import { appendOptimizationAuditEntry } from "./optimizationAuditTrail.js";

export function buildOptimizationBenchmarkRegistry(tenantId, ctx) {
  const improvementSummary = ctx.improvementSummary ?? {};

  const benchmarks = [
    upsertOptimizationBenchmark(
      Object.freeze({
        benchmarkId: `obench-${tenantId}-friction`,
        tenantId,
        label: "Referência de atrito operacional",
        metric: "friction_score",
        referenceValue: 100 - (improvementSummary.activeCycleCount ?? 0) * 10,
        summary: "Quanto menor o atrito, maior a eficiência operacional.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendOptimizationAuditEntry({ tenantId, action: "benchmarks_built", entityType: "benchmark" });

  return Object.freeze({ benchmarks });
}

export default buildOptimizationBenchmarkRegistry;
