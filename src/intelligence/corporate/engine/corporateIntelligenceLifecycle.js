import { CORPORATE_LIFECYCLE_STATES } from "./corporateIntelligenceContracts.js";

export function transitionCorporateLifecycle(currentState, action) {
  const transitions = Object.freeze({
    draft: { aggregate: "aggregated" },
    aggregated: { publish: "published", archive: "archived" },
    published: { archive: "archived" },
  });
  const next = transitions[currentState]?.[action];
  if (!next || !CORPORATE_LIFECYCLE_STATES.includes(next)) return currentState;
  return next;
}

export default { transitionCorporateLifecycle };
