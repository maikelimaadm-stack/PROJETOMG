import { listAdoptionMilestones } from "./adoptionEngineStore.js";
import { classifyAdoptionsByStatus } from "./adoptionStatus.js";

export function computeAdoptionProgress(tenantId, adoptions) {
  const milestones = listAdoptionMilestones(tenantId);
  const statusBreakdown = classifyAdoptionsByStatus(adoptions);

  const totalProgress =
    adoptions.length > 0
      ? Math.round(adoptions.reduce((sum, a) => sum + (a.progressPercent ?? 0), 0) / adoptions.length)
      : 0;

  const achievedMilestones = milestones.filter((m) => m.achieved).length;

  return Object.freeze({
    tenantId,
    computedAt: new Date().toISOString(),
    overallProgressPercent: totalProgress,
    adoptionCount: adoptions.length,
    achievedMilestoneCount: achievedMilestones,
    totalMilestoneCount: milestones.length,
    statusBreakdown,
    explainable: true,
    individualProfilingForbidden: true,
  });
}

export default computeAdoptionProgress;
