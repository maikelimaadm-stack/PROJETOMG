import { DNA_LIFECYCLE_STATES } from "./businessDnaContracts.js";

export function advanceDnaLifecycle(currentState, targetState) {
  const currentIdx = DNA_LIFECYCLE_STATES.indexOf(currentState);
  const targetIdx = DNA_LIFECYCLE_STATES.indexOf(targetState);
  if (currentIdx === -1 || targetIdx === -1) return currentState;
  return targetState;
}

export default { advanceDnaLifecycle };
