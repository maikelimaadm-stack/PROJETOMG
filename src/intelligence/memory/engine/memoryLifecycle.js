import { MEMORY_LIFECYCLE_STATES } from "./memoryEngineContracts.js";

export function assignMemoryLifecycleState(state = "indexed") {
  return MEMORY_LIFECYCLE_STATES.includes(state) ? state : "indexed";
}

export function advanceMemoryLifecycle(record, nextState) {
  return Object.freeze({
    ...record,
    lifecycleState: assignMemoryLifecycleState(nextState),
  });
}

export default assignMemoryLifecycleState;
