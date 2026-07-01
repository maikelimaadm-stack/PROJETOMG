import { FORTRESS_LIFECYCLE_STATES } from "./complianceFortressContracts.js";

export function transitionComplianceLifecycle(currentState, action) {
  const transitions = Object.freeze({
    draft: { activate: "active", review: "under_review" },
    active: { review: "under_review", hold: "held", archive: "archived" },
    under_review: { activate: "active", hold: "held" },
    held: { activate: "active", archive: "archived" },
  });
  const next = transitions[currentState]?.[action];
  if (!next || !FORTRESS_LIFECYCLE_STATES.includes(next)) return currentState;
  return next;
}

export function transitionRetentionLifecycle(currentState, action) {
  const transitions = Object.freeze({
    draft: { activate: "active" },
    active: { archive: "archived", expunge: "expunged" },
    archived: { expunge: "expunged" },
  });
  const next = transitions[currentState]?.[action];
  if (!next || !FORTRESS_LIFECYCLE_STATES.includes(next)) return currentState;
  return next;
}

export function transitionAuditLifecycle(currentState, action) {
  return transitionComplianceLifecycle(currentState, action);
}

export default { transitionComplianceLifecycle, transitionRetentionLifecycle, transitionAuditLifecycle };
