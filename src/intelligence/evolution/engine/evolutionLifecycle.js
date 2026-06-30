import { EVOLUTION_LIFECYCLE_STATES } from "./evolutionEngineContracts.js";

export function advanceEvolutionLifecycle(currentState, targetState) {
  const currentIdx = EVOLUTION_LIFECYCLE_STATES.indexOf(currentState);
  const targetIdx = EVOLUTION_LIFECYCLE_STATES.indexOf(targetState);
  if (currentIdx === -1 || targetIdx === -1) return currentState;
  return targetState;
}

export default { advanceEvolutionLifecycle };
