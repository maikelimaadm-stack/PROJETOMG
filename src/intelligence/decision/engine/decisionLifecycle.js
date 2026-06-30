import { DECISION_LIFECYCLE_STATES } from "./decisionEngineContracts.js";

export function advanceDecisionLifecycle(currentState, targetState) {
  const currentIdx = DECISION_LIFECYCLE_STATES.indexOf(currentState);
  const targetIdx = DECISION_LIFECYCLE_STATES.indexOf(targetState);
  if (currentIdx === -1 || targetIdx === -1) return currentState;
  return targetState;
}

export function isDecisionPendingApproval(state) {
  return state === "pending_approval" || state === "draft";
}

export default { advanceDecisionLifecycle, isDecisionPendingApproval };
