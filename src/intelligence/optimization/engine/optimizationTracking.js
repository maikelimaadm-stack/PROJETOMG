import { listOptimizationLoops, listOptimizationMilestones } from "./optimizationEngineStore.js";

export function trackOptimizationProgress(tenantId = "default") {
  const loops = listOptimizationLoops(tenantId);
  const milestones = listOptimizationMilestones(tenantId);
  const achieved = milestones.filter((m) => m.achieved);

  return Object.freeze({
    tenantId,
    trackedAt: new Date().toISOString(),
    loopCount: loops.length,
    achievedMilestoneCount: achieved.length,
    activeLoops: loops.filter((l) => l.lifecycleState === "in_loop" || l.lifecycleState === "proposed"),
    explainable: true,
    individualProfilingForbidden: true,
  });
}

export default trackOptimizationProgress;
