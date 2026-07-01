import { IMPROVEMENT_LIFECYCLE_STATES } from "./improvementEngineContracts.js";

export function transitionImprovementLifecycle(currentState, action) {
  const transitions = Object.freeze({
    draft: { observe: "observing" },
    observing: { start: "in_cycle", archive: "archived" },
    in_cycle: { validate: "validating", complete: "completed" },
    validating: { complete: "completed", revert: "in_cycle" },
    completed: { archive: "archived" },
  });
  const next = transitions[currentState]?.[action];
  if (!next || !IMPROVEMENT_LIFECYCLE_STATES.includes(next)) return currentState;
  return next;
}

export default { transitionImprovementLifecycle };
