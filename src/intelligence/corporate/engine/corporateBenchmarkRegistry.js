import { upsertCorporateBenchmark } from "./corporateIntelligenceStore.js";
import { appendCorporateAuditEntry } from "./corporateIntelligenceAuditTrail.js";

export function buildCorporateBenchmarkRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ benchmarks: [] });

  const benchmarks = [
    upsertCorporateBenchmark(
      Object.freeze({
        benchmarkId: `cbench-${groupId}-adoption`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Referência de adoção do grupo",
        metric: "adoption_progress",
        referenceValue: ctx.adoptionSummary?.overallProgressPercent ?? 0,
        summary: "Progresso médio de adoção entre empresas autorizadas.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
    upsertCorporateBenchmark(
      Object.freeze({
        benchmarkId: `cbench-${groupId}-maturity`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Referência de maturidade do grupo",
        metric: "maturity_score",
        referenceValue: ctx.dnaSummary?.maturityScore ?? 50,
        summary: "Maturidade operacional de referência do grupo autorizado.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendCorporateAuditEntry({ groupId, action: "benchmarks_built", entityType: "benchmark" });

  return Object.freeze({ benchmarks });
}

export default buildCorporateBenchmarkRegistry;
