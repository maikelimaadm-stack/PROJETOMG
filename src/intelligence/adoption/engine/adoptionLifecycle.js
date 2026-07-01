import { ADOPTION_LIFECYCLE_STATES } from "./adoptionEngineContracts.js";

export function transitionAdoptionLifecycle(currentState, action) {
  const transitions = Object.freeze({
    draft: { track: "tracking", reject: "rejected" },
    tracking: { start: "in_progress", reject: "rejected", archive: "archived" },
    in_progress: { validate: "validating", complete: "completed", reject: "rejected" },
    validating: { complete: "completed", revert: "in_progress" },
    completed: { archive: "archived" },
    rejected: { archive: "archived" },
  });

  const next = transitions[currentState]?.[action];
  if (!next || !ADOPTION_LIFECYCLE_STATES.includes(next)) return currentState;
  return next;
}

export function getAdoptionLifecycleInfo(adoption) {
  return Object.freeze({
    adoptionId: adoption.adoptionId,
    currentState: adoption.lifecycleState ?? "tracking",
    allowedTransitions: Object.freeze(["start", "validate", "complete", "reject"]),
    requiresHumanApproval: true,
    autonomousTransitionForbidden: true,
  });
}

export default { transitionAdoptionLifecycle, getAdoptionLifecycleInfo };
