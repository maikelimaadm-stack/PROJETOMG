import { upsertEvolutionProgress } from "./evolutionEngineStore.js";
import { appendEvolutionAuditEntry } from "./evolutionAuditTrail.js";

/** Track evolution progress over time — observational only */
export function trackEvolutionProgress(input) {
  const entry = Object.freeze({
    progressId: input.progressId ?? `eprog-${input.tenantId}-${Date.now()}`,
    tenantId: input.tenantId ?? "default",
    planId: input.planId ?? null,
    milestoneId: input.milestoneId ?? null,
    label: input.label ?? "Progresso de evolução",
    percentComplete: input.percentComplete ?? 0,
    status: input.status ?? "tracking",
    recordedAt: new Date().toISOString(),
    explainable: true,
    autonomousExecutionForbidden: true,
  });
  upsertEvolutionProgress(entry);
  appendEvolutionAuditEntry({
    tenantId: entry.tenantId,
    action: "progress_tracked",
    entityId: entry.progressId,
    entityType: "progress",
  });
  return entry;
}

export function computeProgressSummary(tenantId, progressEntries = []) {
  if (!progressEntries.length) {
    return Object.freeze({ tenantId, averageProgress: 0, trackingCount: 0, explainable: true });
  }
  const avg = Math.round(
    progressEntries.reduce((sum, p) => sum + (p.percentComplete ?? 0), 0) / progressEntries.length
  );
  return Object.freeze({
    tenantId,
    averageProgress: avg,
    trackingCount: progressEntries.length,
    explainable: true,
  });
}

export default { trackEvolutionProgress, computeProgressSummary };
