import { DECISION_CONFIDENCE_LEVELS } from "./decisionEngineContracts.js";

/** Confidence scoring — explainable, not opaque ML scores */
export function scoreDecisionConfidence(input) {
  let score = 0;
  const factors = [];

  if ((input.evidenceCount ?? 0) >= 3) {
    score += 2;
    factors.push("Múltiplas evidências operacionais");
  } else if ((input.evidenceCount ?? 0) >= 1) {
    score += 1;
    factors.push("Evidência operacional disponível");
  }

  if (input.hasConsultingRecommendation) {
    score += 2;
    factors.push("Recomendação de consultoria vinculada");
  }

  if (input.hasKnowledgeGraphContext) {
    score += 1;
    factors.push("Contexto de conhecimento organizacional");
  }

  if (input.hasMemoryHistory) {
    score += 1;
    factors.push("Histórico de memória operacional");
  }

  let level = DECISION_CONFIDENCE_LEVELS[0];
  if (score >= 5) level = DECISION_CONFIDENCE_LEVELS[2];
  else if (score >= 3) level = DECISION_CONFIDENCE_LEVELS[1];

  return Object.freeze({
    level,
    score,
    factors: Object.freeze(factors),
    explainable: true,
    aiGenerated: false,
  });
}

export default scoreDecisionConfidence;
