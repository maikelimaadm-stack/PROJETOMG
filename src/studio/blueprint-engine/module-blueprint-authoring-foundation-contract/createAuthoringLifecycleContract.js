import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_LIFECYCLE_STATES,
  AUTHORING_LIFECYCLE_TRANSITIONS,
  FORBIDDEN_LIFECYCLE_STATES,
  authoringFoundationDigest,
} from './authoringFoundationContractConfig.js';

/**
 * The AUTHORING LIFECYCLE CONTRACT — declares the canonical draft lifecycle states, the allowed
 * transitions (draft -> validation -> validated -> preview -> handoff, with `discarded` terminal), and
 * the FORBIDDEN states the foundation must never emit (published/production/registered/generated/
 * deployed/persisted/certified). Metadata only; describes states, drives no runtime. Pure and
 * deterministic — returns pure data (no functions), so two calls deep-equal.
 *
 * The allowed transitions are materialized as a flat list of `from->to` pairs so consumers can check
 * transitions without executing any code from this layer.
 *
 * @returns {Object}
 */
export function createAuthoringLifecycleContract() {
  const allowedTransitionPairs = [];
  for (const from of AUTHORING_LIFECYCLE_STATES) {
    const targets = Array.isArray(AUTHORING_LIFECYCLE_TRANSITIONS[from]) ? AUTHORING_LIFECYCLE_TRANSITIONS[from] : [];
    for (const to of targets) {
      if (!FORBIDDEN_LIFECYCLE_STATES.includes(to)) allowedTransitionPairs.push(`${from}->${to}`);
    }
  }

  const core = {
    kind: 'authoring-lifecycle-contract',
    states: [...AUTHORING_LIFECYCLE_STATES],
    transitions: Object.fromEntries(
      Object.entries(AUTHORING_LIFECYCLE_TRANSITIONS).map(([k, v]) => [k, [...v]]),
    ),
    allowedTransitionPairs,
    forbiddenStates: [...FORBIDDEN_LIFECYCLE_STATES],
    initialState: 'empty',
    terminalState: 'discarded',
    canonical: false,
    draftLifecycleOnly: true,
    emitsForbiddenState: false,
    drivesRuntime: false,
    stateCount: AUTHORING_LIFECYCLE_STATES.length,
    transitionPairCount: allowedTransitionPairs.length,
    forbiddenStateCount: FORBIDDEN_LIFECYCLE_STATES.length,
  };
  return safeCloneGenericModel({ ...core, lifecycleDigest: authoringFoundationDigest(core) });
}

export default createAuthoringLifecycleContract;
