import { GOVERNANCE_LIFECYCLE_STATES } from "./platformGovernanceContracts.js";

export function transitionGovernanceLifecycle(currentState, action) {
  const transitions = Object.freeze({
    draft: { activate: "active", review: "under_review" },
    active: { review: "under_review", suspend: "suspended", archive: "archived" },
    under_review: { activate: "active", suspend: "suspended" },
    suspended: { activate: "active", archive: "archived" },
  });
  const next = transitions[currentState]?.[action];
  if (!next || !GOVERNANCE_LIFECYCLE_STATES.includes(next)) return currentState;
  return next;
}

export default { transitionGovernanceLifecycle };
