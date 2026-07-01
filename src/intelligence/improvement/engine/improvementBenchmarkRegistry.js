import { upsertImprovementBenchmark } from "./improvementEngineStore.js";
import { appendImprovementAuditEntry } from "./improvementAuditTrail.js";

export function buildImprovementBenchmarkRegistry(tenantId, ctx, options = {}) {
  const benchmarks = [
    upsertImprovementBenchmark(
      Object.freeze({
        benchmarkId: `ibench-${tenantId}-adoption-impact`,
        tenantId,
        label: "Referência de impacto pós-adoção",
        metric: "validated_outcomes",
        referenceValue: ctx.validatedOutcomes?.length ?? 0,
        summary: "Melhorias com impacto validado pela empresa.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertImprovementBenchmark(
      Object.freeze({
        benchmarkId: `ibench-${tenantId}-maturity`,
        tenantId,
        label: "Referência de maturidade operacional",
        metric: "maturity_score",
        referenceValue: ctx.dnaSummary?.maturityScore ?? 50,
        summary: "Baseline de maturidade para próximos ciclos de melhoria.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendImprovementAuditEntry({ tenantId, action: "benchmarks_built", entityType: "benchmark" });

  return Object.freeze({ benchmarks });
}

export default buildImprovementBenchmarkRegistry;
