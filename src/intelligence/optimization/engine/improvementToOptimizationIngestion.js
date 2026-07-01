/**
 * Improvement → Optimization Loop ingestion.
 */
import { assembleOptimizationContext } from "./optimizationContextAssembly.js";
import { registerOptimizationSignals } from "./optimizationSignals.js";
import { buildOptimizationOpportunities } from "./optimizationOpportunities.js";
import { buildOptimizationPlans } from "./optimizationPlans.js";
import { buildOptimizationMilestones } from "./optimizationMilestones.js";
import { buildOptimizationBenchmarkRegistry } from "./optimizationBenchmarkRegistry.js";
import { appendOptimizationAuditEntry } from "./optimizationAuditTrail.js";
import { OPTIMIZATION_ENGINE_VERSION, OPTIMIZATION_OWNERSHIP } from "./optimizationEngineContracts.js";
import { ingestOptimizationToPortfolio } from "../../portfolio/engine/optimizationToPortfolioIngestion.js";

export function analyzeOptimizationContext(tenantId = "default", options = {}) {
  const ctx = assembleOptimizationContext(tenantId, options);
  const signals = registerOptimizationSignals(tenantId, ctx);
  const { opportunities } = buildOptimizationOpportunities(tenantId, ctx, signals);
  const { loops, plans } = buildOptimizationPlans(tenantId, opportunities);
  const { milestones } = buildOptimizationMilestones(tenantId, loops);
  const benchmarks = buildOptimizationBenchmarkRegistry(tenantId, ctx);

  appendOptimizationAuditEntry({
    tenantId,
    action: "optimization_analyzed",
    entityId: loops[0]?.loopId ?? null,
    entityType: "analysis",
  });

  if (options.groupId) {
    try {
      ingestOptimizationToPortfolio(options.groupId, tenantId, {
        ...options,
        optimizationLoopId: loops[0]?.loopId ?? null,
        loops,
      });
    } catch {
      /* non-blocking portfolio ingestion */
    }
  }

  return Object.freeze({
    tenantId,
    analyzedAt: new Date().toISOString(),
    engineVersion: OPTIMIZATION_ENGINE_VERSION,
    signals,
    opportunities,
    loops,
    plans,
    milestones,
    benchmarks,
    ...OPTIMIZATION_OWNERSHIP,
    explainable: true,
  });
}

export function ingestImprovementToOptimization(tenantId = "default", options = {}) {
  return analyzeOptimizationContext(tenantId, options);
}

export default { analyzeOptimizationContext, ingestImprovementToOptimization };
