/**
 * Adoption → Continuous Improvement ingestion.
 */
import { assembleImprovementContext } from "./improvementContextAssembly.js";
import { registerImprovementSignals } from "./improvementSignals.js";
import { buildImprovementOpportunities } from "./improvementOpportunities.js";
import { buildImprovementPlans } from "./improvementPlans.js";
import { buildImprovementMilestones } from "./improvementMilestones.js";
import { buildImprovementBenchmarkRegistry } from "./improvementBenchmarkRegistry.js";
import { registerImprovementSeed } from "./improvementSeedsRegistry.js";
import { appendImprovementAuditEntry } from "./improvementAuditTrail.js";
import { IMPROVEMENT_ENGINE_VERSION, IMPROVEMENT_OWNERSHIP } from "./improvementEngineContracts.js";
import { ingestImprovementToOptimization } from "../../optimization/engine/improvementToOptimizationIngestion.js";

export function analyzeImprovementContext(tenantId = "default", options = {}) {
  const ctx = assembleImprovementContext(tenantId, options);
  const signals = registerImprovementSignals(tenantId, ctx);
  const { opportunities } = buildImprovementOpportunities(tenantId, ctx, signals);
  const { loops, plans } = buildImprovementPlans(tenantId, opportunities);
  const { milestones } = buildImprovementMilestones(tenantId, loops);
  const benchmarks = buildImprovementBenchmarkRegistry(tenantId, ctx, options);

  if (loops[0]) {
    registerImprovementSeed(tenantId, { loopId: loops[0].loopId, source: "adoption_to_improvement_ingestion" });
  }

  appendImprovementAuditEntry({
    tenantId,
    action: "improvement_analyzed",
    entityId: loops[0]?.loopId ?? null,
    entityType: "analysis",
  });

  try {
    ingestImprovementToOptimization(tenantId, { ...options, improvementLoops: loops, improvementContext: ctx });
  } catch {
    // non-blocking
  }

  return Object.freeze({
    tenantId,
    analyzedAt: new Date().toISOString(),
    engineVersion: IMPROVEMENT_ENGINE_VERSION,
    signals,
    opportunities,
    loops,
    plans,
    milestones,
    benchmarks,
    ...IMPROVEMENT_OWNERSHIP,
    explainable: true,
  });
}

export function ingestAdoptionToImprovement(tenantId = "default", options = {}) {
  return analyzeImprovementContext(tenantId, options);
}

export function replayImprovementFromStack(tenantId = "default", options = {}) {
  return analyzeImprovementContext(tenantId, options);
}

export default { analyzeImprovementContext, ingestAdoptionToImprovement, replayImprovementFromStack };
