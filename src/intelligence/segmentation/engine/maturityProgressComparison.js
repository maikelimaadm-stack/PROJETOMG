import { computeAdvancedMaturityScore } from "./advancedMaturityScoring.js";
import { buildMaturityBenchmarks } from "./maturityBenchmarks.js";

export function compareMaturityProgress(tenantId = "default", groupId = null) {
  const current = computeAdvancedMaturityScore(tenantId);
  const benchmarks = buildMaturityBenchmarks(tenantId, groupId);
  const groupBench = benchmarks.find((b) => b.scope === "authorized_group");
  const selfBench = benchmarks.find((b) => b.scope === "tenant");

  return Object.freeze({
    tenantId,
    currentScore: current.advancedScore,
    selfBaseline: selfBench?.advancedScore ?? current.advancedScore,
    groupAverage: groupBench?.advancedScore ?? null,
    vsGroup: groupBench
      ? current.advancedScore >= groupBench.advancedScore
        ? "above"
        : current.advancedScore < groupBench.advancedScore * 0.9
          ? "below"
          : "at"
      : null,
    priorityDomains: current.priorityDomains,
    explainable: true,
    crossTenantMixingForbidden: true,
  });
}

export default compareMaturityProgress;
