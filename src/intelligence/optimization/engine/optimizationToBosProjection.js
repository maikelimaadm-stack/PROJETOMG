/**
 * Optimization → BOS projection — business vocabulary only.
 */
import { summarizeOptimizationEngine } from "./optimizationSummarization.js";
import { retrieveLatestOptimizations } from "./optimizationRetrieval.js";
import { analyzeOptimizationContext } from "./improvementToOptimizationIngestion.js";
import { explainOptimizationLoop } from "./optimizationExplainability.js";
import { trackOptimizationProgress } from "./optimizationTracking.js";

export function buildOptimizationBosProjection(tenantId = "default", options = {}) {
  let summary = summarizeOptimizationEngine(tenantId);
  if (summary.loopCount === 0) {
    analyzeOptimizationContext(tenantId, options);
    summary = summarizeOptimizationEngine(tenantId);
  }

  const retrieved = retrieveLatestOptimizations(tenantId);
  const tracking = trackOptimizationProgress(tenantId);

  const activeLoops = retrieved.loops
    .filter((l) => l.lifecycleState === "in_loop" || l.lifecycleState === "proposed")
    .slice(0, 5)
    .map((l) => {
      const explained = explainOptimizationLoop(l);
      return Object.freeze({
        id: l.loopId,
        label: l.title,
        context: l.summary,
        because: explained.because,
        requiresHumanApproval: true,
      });
    });

  const optimizationOpportunities = retrieved.opportunities.slice(0, 5).map((o) =>
    Object.freeze({
      id: o.opportunityId,
      label: o.title,
      context: o.summary,
      priority: o.priority,
      requiresHumanApproval: true,
    })
  );

  const benchmarks = retrieved.benchmarks.slice(0, 3).map((b) =>
    Object.freeze({
      id: b.benchmarkId,
      label: b.label,
      value: b.referenceValue,
      context: b.summary,
    })
  );

  const feedbackLoop = Object.freeze({
    label: "Feedback operacional",
    context: "Recomendação → Adoção → Melhoria → Otimização — ciclo contínuo com aprovação humana.",
    requiresHuman: true,
  });

  return Object.freeze({
    hasOptimization: summary.loopCount > 0,
    summary: summary.headline,
    optimizationSummary: summary,
    activeOptimizationLoops: activeLoops,
    optimizationOpportunities,
    optimizationBenchmarks: benchmarks,
    operationalFeedbackLoop: feedbackLoop,
    optimizationTracking: Object.freeze({
      loopCount: tracking.loopCount,
      achievedMilestoneCount: tracking.achievedMilestoneCount,
    }),
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
  });
}

export default buildOptimizationBosProjection;
