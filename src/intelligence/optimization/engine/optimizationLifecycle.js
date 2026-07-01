import { OPTIMIZATION_LIFECYCLE_STATES } from "./optimizationEngineContracts.js";

export function transitionOptimizationLifecycle(currentState, action) {
  const transitions = Object.freeze({
    draft: { propose: "proposed" },
    proposed: { start: "in_loop", archive: "archived" },
    in_loop: { measure: "measuring", complete: "completed" },
    measuring: { complete: "completed", revert: "in_loop" },
    completed: { archive: "archived" },
  });
  const next = transitions[currentState]?.[action];
  if (!next || !OPTIMIZATION_LIFECYCLE_STATES.includes(next)) return currentState;
  return next;
}

export default { transitionOptimizationLifecycle };
