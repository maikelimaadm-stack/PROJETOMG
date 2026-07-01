import { PORTFOLIO_LIFECYCLE_STATES } from "./portfolioIntelligenceContracts.js";

export function transitionPortfolioLifecycle(currentState, action) {
  const transitions = Object.freeze({
    draft: { aggregate: "aggregated" },
    aggregated: { publish: "published", archive: "archived" },
    published: { archive: "archived" },
  });
  const next = transitions[currentState]?.[action];
  if (!next || !PORTFOLIO_LIFECYCLE_STATES.includes(next)) return currentState;
  return next;
}

export default { transitionPortfolioLifecycle };
