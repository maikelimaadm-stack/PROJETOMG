import { summarizeEvolutionEngine } from "./evolutionSummarization.js";
import { listEvolutionPlans, listEvolutionMilestones } from "./evolutionEngineStore.js";

export function buildEvolutionSeedsRegistry(tenantId = "default") {
  const summary = summarizeEvolutionEngine(tenantId);
  const plans = listEvolutionPlans(tenantId, { limit: 10 });
  const milestones = listEvolutionMilestones(tenantId, { limit: 10 });

  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    seedCount: plans.length + milestones.length,
    planSeeds: plans.map((p) => Object.freeze({ id: p.planId, title: p.title })),
    milestoneSeeds: milestones.map((m) => Object.freeze({ id: m.milestoneId, label: m.label })),
    summary,
    forBusinessDna: false,
  });
}

export default buildEvolutionSeedsRegistry;
