import { computeAdvancedMaturityScore } from "./advancedMaturityScoring.js";

export function buildAdvancedMaturityRadar(tenantId = "default") {
  const scoring = computeAdvancedMaturityScore(tenantId);

  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    averageScore: scoring.advancedScore,
    domains: scoring.domainScores.map((d) =>
      Object.freeze({
        id: d.domainId,
        label: d.label,
        level: d.level,
        score: d.score,
        weightedScore: d.weightedScore,
        maxScore: 3,
      })
    ),
    priorityDomains: scoring.priorityDomains,
    explainable: true,
  });
}

export default buildAdvancedMaturityRadar;
