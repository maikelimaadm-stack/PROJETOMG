import { upsertMaturityBenchmark } from "./segmentationEngineStore.js";
import { computeAdvancedMaturityScore } from "./advancedMaturityScoring.js";
import { getAuthorizedGroupScope } from "../../dna/engine/businessDnaStore.js";

/** Internal maturity benchmarks — tenant or authorized group */
export function buildMaturityBenchmarks(tenantId = "default", groupId = null) {
  const tenantScore = computeAdvancedMaturityScore(tenantId);
  const benchmarks = [];

  benchmarks.push(
    upsertMaturityBenchmark(
      Object.freeze({
        benchmarkId: `bench-${tenantId}-self`,
        tenantId,
        label: "Referência interna da empresa",
        advancedScore: tenantScore.advancedScore,
        scope: "tenant",
        because: "Benchmark baseado na maturidade avançada atual da empresa.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  if (groupId) {
    const scope = getAuthorizedGroupScope(groupId);
    if (scope?.authorizedTenantIds.includes(tenantId)) {
      const groupScores = scope.authorizedTenantIds.map((tid) => computeAdvancedMaturityScore(tid));
      const groupAvg =
        groupScores.reduce((s, g) => s + g.advancedScore, 0) / (groupScores.length || 1);
      benchmarks.push(
        upsertMaturityBenchmark(
          Object.freeze({
            benchmarkId: `bench-${groupId}-group`,
            tenantId,
            groupId,
            label: "Média do grupo autorizado",
            advancedScore: Math.round(groupAvg * 10) / 10,
            scope: "authorized_group",
            because: `Média de ${scope.authorizedTenantIds.length} empresa(s) no portfólio autorizado.`,
            crossTenantMixingForbidden: true,
            explainable: true,
            recordedAt: new Date().toISOString(),
          })
        )
      );
    }
  }

  return Object.freeze(benchmarks);
}

export default buildMaturityBenchmarks;
