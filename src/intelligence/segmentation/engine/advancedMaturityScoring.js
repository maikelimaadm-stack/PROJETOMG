import { computeDnaCapabilityMaturity } from "../../dna/engine/businessDnaMaturityModel.js";
import { assembleBusinessDnaContext } from "../../dna/engine/businessDnaContextAssembly.js";

const DOMAIN_WEIGHTS = Object.freeze({
  operations: 1.2,
  knowledge: 1.0,
  consulting: 0.9,
  decisions: 1.1,
  evolution: 1.0,
});

/** Advanced maturity scoring with weighted domains */
export function computeAdvancedMaturityScore(tenantId = "default") {
  const ctx = assembleBusinessDnaContext(tenantId);
  const maturity = computeDnaCapabilityMaturity(ctx);

  let weightedSum = 0;
  let weightTotal = 0;
  const domainScores = maturity.capabilities.map((cap) => {
    const weight = DOMAIN_WEIGHTS[cap.domainId] ?? 1;
    weightedSum += cap.score * weight;
    weightTotal += weight;
    return Object.freeze({
      domainId: cap.domainId,
      label: cap.label,
      level: cap.level,
      score: cap.score,
      weight,
      weightedScore: Math.round(cap.score * weight * 10) / 10,
    });
  });

  const advancedScore = Math.round((weightedSum / (weightTotal || 1)) * 10) / 10;

  return Object.freeze({
    tenantId,
    advancedScore,
    overallLevel: maturity.overallLevel,
    domainScores: Object.freeze(domainScores),
    priorityDomains: Object.freeze(
      domainScores.filter((d) => d.score <= 1).map((d) => d.label)
    ),
    explainable: true,
    organizationalScope: true,
  });
}

export default computeAdvancedMaturityScore;
