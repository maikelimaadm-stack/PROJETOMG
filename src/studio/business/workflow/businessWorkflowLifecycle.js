import { BUSINESS_WORKFLOW_LIFECYCLE_STATES } from "../contracts/businessWorkflowContracts.js";

export function createBusinessWorkflowLifecycle(partial = {}) {
  const state = partial.state ?? "active";
  return Object.freeze({
    state,
    validStates: BUSINESS_WORKFLOW_LIFECYCLE_STATES,
    createdAt: partial.createdAt ?? new Date().toISOString(),
    activatedAt: partial.activatedAt ?? (state === "active" ? new Date().toISOString() : null),
    deprecatedAt: partial.deprecatedAt ?? null,
    archivedAt: partial.archivedAt ?? null,
    transitionHistory: Object.freeze([...(partial.transitionHistory ?? [])]),
  });
}

export function transitionBusinessWorkflowLifecycle(lifecycle, nextState) {
  if (!BUSINESS_WORKFLOW_LIFECYCLE_STATES.includes(nextState)) {
    return Object.freeze({ ok: false, lifecycle, error: `Invalid lifecycle state: ${nextState}` });
  }
  const transition = Object.freeze({ from: lifecycle.state, to: nextState, at: new Date().toISOString() });
  return Object.freeze({
    ok: true,
    lifecycle: createBusinessWorkflowLifecycle({
      ...lifecycle,
      state: nextState,
      activatedAt: nextState === "active" ? transition.at : lifecycle.activatedAt,
      deprecatedAt: nextState === "deprecated" ? transition.at : lifecycle.deprecatedAt,
      archivedAt: nextState === "archived" ? transition.at : lifecycle.archivedAt,
      transitionHistory: [...lifecycle.transitionHistory, transition],
    }),
  });
}

export default createBusinessWorkflowLifecycle;
