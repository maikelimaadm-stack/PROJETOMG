import { ADOPTION_STATUS_TYPES } from "./adoptionEngineContracts.js";

export function resolveAdoptionStatus(adoption) {
  if (!adoption) return ADOPTION_STATUS_TYPES.PROPOSED;
  if (adoption.status) return adoption.status;
  if (adoption.lifecycleState === "rejected") return ADOPTION_STATUS_TYPES.REJECTED;
  if (adoption.lifecycleState === "completed") return ADOPTION_STATUS_TYPES.COMPLETED;
  if (adoption.progressPercent >= 60) return ADOPTION_STATUS_TYPES.IN_PROGRESS;
  if (adoption.progressPercent >= 40) return ADOPTION_STATUS_TYPES.ACCEPTED;
  return ADOPTION_STATUS_TYPES.PROPOSED;
}

export function classifyAdoptionsByStatus(adoptions) {
  const accepted = adoptions.filter(
    (a) =>
      a.status === ADOPTION_STATUS_TYPES.ACCEPTED ||
      a.status === ADOPTION_STATUS_TYPES.IN_PROGRESS ||
      a.status === ADOPTION_STATUS_TYPES.COMPLETED ||
      a.status === ADOPTION_STATUS_TYPES.VALIDATING
  );
  const rejected = adoptions.filter((a) => a.status === ADOPTION_STATUS_TYPES.REJECTED);
  const inProgress = adoptions.filter(
    (a) => a.status === ADOPTION_STATUS_TYPES.IN_PROGRESS || a.status === ADOPTION_STATUS_TYPES.VALIDATING
  );
  const pending = adoptions.filter((a) => a.status === ADOPTION_STATUS_TYPES.PROPOSED);

  return Object.freeze({
    accepted,
    rejected,
    inProgress,
    pending,
    acceptedCount: accepted.length,
    rejectedCount: rejected.length,
    inProgressCount: inProgress.length,
    pendingCount: pending.length,
  });
}

export default { resolveAdoptionStatus, classifyAdoptionsByStatus };
