import { AUTHORING_LIFECYCLE_STATES, AUTHORING_LIFECYCLE_TRANSITIONS, FORBIDDEN_LIFECYCLE_STATES } from './authoringRuntimeConfig.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * The LIFECYCLE EXECUTOR descriptor (pure data) + pure transition helpers. `discarded` is terminal;
 * unknown transitions fail closed; forbidden (productive/certified) states are never targeted.
 * @returns {Object}
 */
export function createLifecycleExecutor() {
  const core = {
    kind: 'authoring-lifecycle-executor',
    states: [...AUTHORING_LIFECYCLE_STATES],
    transitions: Object.fromEntries(Object.entries(AUTHORING_LIFECYCLE_TRANSITIONS).map(([k, v]) => [k, [...v]])),
    forbiddenStates: [...FORBIDDEN_LIFECYCLE_STATES],
    initialState: 'empty',
    terminalState: 'discarded',
    lifecycleRuntimeImplemented: true,
    emitsForbiddenState: false,
    unknownTransitionFailClosed: true,
  };
  return Object.freeze({ ...core, lifecycleExecutorDigest: createDeterministicDigest(core) });
}

/**
 * Pure transition check. Never throws. Forbidden target states are always disallowed.
 * @param {string} from @param {string} to @returns {boolean}
 */
export function isLifecycleTransitionAllowed(from, to) {
  if (typeof from !== 'string' || typeof to !== 'string') return false;
  if (FORBIDDEN_LIFECYCLE_STATES.includes(to)) return false;
  const allowed = AUTHORING_LIFECYCLE_TRANSITIONS[from];
  return Array.isArray(allowed) && allowed.includes(to);
}

export default createLifecycleExecutor;
