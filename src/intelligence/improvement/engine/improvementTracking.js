import { listImprovementLoops, listImprovementMilestones } from "./improvementEngineStore.js";

export function trackImprovementProgress(tenantId = "default") {
  const loops = listImprovementLoops(tenantId);
  const milestones = listImprovementMilestones(tenantId);
  const achieved = milestones.filter((m) => m.achieved);

  return Object.freeze({
    tenantId,
    trackedAt: new Date().toISOString(),
    loopCount: loops.length,
    achievedMilestoneCount: achieved.length,
    totalMilestoneCount: milestones.length,
    activeLoops: loops.filter((l) => l.lifecycleState === "in_cycle" || l.lifecycleState === "observing"),
    explainable: true,
    individualProfilingForbidden: true,
  });
}

export default trackImprovementProgress;
