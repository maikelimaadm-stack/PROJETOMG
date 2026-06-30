import { MATURITY_LEVELS } from "./evolutionEngineContracts.js";

/** Evolution maturity model — capability-based, explainable */
export function computeEvolutionMaturity(ctx) {
  const memoryCount = ctx.memorySummary?.recordCount ?? 0;
  const graphNodes = ctx.graphSummary?.nodeCount ?? 0;
  const consultingRecs = ctx.consultingRetrieved?.recommendations?.length ?? 0;
  const approvedDecisions =
    ctx.decisionRetrieved?.documents?.filter((d) => d.lifecycleState === "approved").length ?? 0;

  let score = 0;
  const capabilities = [];

  if (memoryCount >= 5) {
    score += 2;
    capabilities.push(Object.freeze({ id: "operational.memory", label: "Memória operacional", level: MATURITY_LEVELS[2] }));
  } else if (memoryCount >= 1) {
    score += 1;
    capabilities.push(Object.freeze({ id: "operational.memory", label: "Memória operacional", level: MATURITY_LEVELS[1] }));
  } else {
    capabilities.push(Object.freeze({ id: "operational.memory", label: "Memória operacional", level: MATURITY_LEVELS[0] }));
  }

  if (graphNodes >= 3) {
    score += 2;
    capabilities.push(Object.freeze({ id: "knowledge.organization", label: "Conhecimento organizado", level: MATURITY_LEVELS[2] }));
  } else if (graphNodes >= 1) {
    score += 1;
    capabilities.push(Object.freeze({ id: "knowledge.organization", label: "Conhecimento organizado", level: MATURITY_LEVELS[1] }));
  } else {
    capabilities.push(Object.freeze({ id: "knowledge.organization", label: "Conhecimento organizado", level: MATURITY_LEVELS[0] }));
  }

  if (consultingRecs >= 1) {
    score += 1;
    capabilities.push(Object.freeze({ id: "consulting.readiness", label: "Consultoria operacional", level: MATURITY_LEVELS[1] }));
  }

  if (approvedDecisions >= 1) {
    score += 2;
    capabilities.push(Object.freeze({ id: "decision.discipline", label: "Disciplina decisória", level: MATURITY_LEVELS[2] }));
  } else {
    capabilities.push(Object.freeze({ id: "decision.discipline", label: "Disciplina decisória", level: MATURITY_LEVELS[0] }));
  }

  let overallLevel = MATURITY_LEVELS[0];
  if (score >= 6) overallLevel = MATURITY_LEVELS[3];
  else if (score >= 4) overallLevel = MATURITY_LEVELS[2];
  else if (score >= 2) overallLevel = MATURITY_LEVELS[1];

  return Object.freeze({
    tenantId: ctx.tenantId,
    computedAt: new Date().toISOString(),
    overallLevel,
    score,
    capabilities: Object.freeze(capabilities),
    needsMaturation: Object.freeze(capabilities.filter((c) => c.level === MATURITY_LEVELS[0] || c.level === MATURITY_LEVELS[1])),
    explainable: true,
    aiGenerated: false,
  });
}

export default computeEvolutionMaturity;
