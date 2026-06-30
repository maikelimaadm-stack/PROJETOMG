import { CONSULTING_LIFECYCLE_STATES } from "./consultingEngineContracts.js";

export function advanceConsultingLifecycle(currentState, targetState) {
  const currentIdx = CONSULTING_LIFECYCLE_STATES.indexOf(currentState);
  const targetIdx = CONSULTING_LIFECYCLE_STATES.indexOf(targetState);
  if (currentIdx === -1 || targetIdx === -1) return currentState;
  if (targetIdx < currentIdx) return currentState;
  return targetState;
}

export function isConsultingActionable(state) {
  return state === "suggested" || state === "reviewed";
}

export default { advanceConsultingLifecycle, isConsultingActionable };
