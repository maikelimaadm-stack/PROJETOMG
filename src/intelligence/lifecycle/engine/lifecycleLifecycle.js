import { LIFECYCLE_DATA_STATES } from "./dataLifecycleContracts.js";

export function resolveLifecycleStateTransition(currentState, action, approved = false) {
  if (!approved && ["archive", "expunge", "release_hold"].includes(action)) {
    return Object.freeze({ allowed: false, nextState: currentState, reason: "Aprovação humana necessária." });
  }
  const transitions = Object.freeze({
    active: Object.freeze({ archive: "scheduled_archive", hold: "on_hold", expunge: "expunge_pending_approval" }),
    scheduled_archive: Object.freeze({ execute_archive: "archived", cancel: "active" }),
    archived: Object.freeze({ hold: "on_hold", expunge: "expunge_pending_approval" }),
    on_hold: Object.freeze({ release_hold: "active", archive: "scheduled_archive" }),
    expunge_pending_approval: Object.freeze({ approve_expunge: "expunged", reject: "active" }),
    scheduled_expunge: Object.freeze({ approve_expunge: "expunged", reject: "active" }),
  });
  const next = transitions[currentState]?.[action];
  if (!next) {
    return Object.freeze({ allowed: false, nextState: currentState, reason: "Transição não permitida." });
  }
  return Object.freeze({ allowed: true, nextState: next, reason: null });
}

export function buildLifecycleLifecycleRecord(groupId) {
  return Object.freeze({
    groupId,
    states: LIFECYCLE_DATA_STATES,
    autonomousTransitionForbidden: true,
    humanApprovalRequiredForSensitive: true,
    explainable: true,
  });
}

export default resolveLifecycleStateTransition;
