import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_LIFECYCLE_STATES, FORBIDDEN_LIFECYCLE_STATES, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Lifecycle runtime PLAN — plans future execution of the draft lifecycle states, terminal=discarded,
 * with production/certified states forbidden and self-certification disallowed. Metadata only.
 * @returns {Object}
 */
export function createLifecycleRuntimePlan() {
  const core = {
    kind: 'authoring-lifecycle-runtime-plan',
    lifecycleRuntimePlanned: true,
    lifecycleRuntimeImplemented: false,
    states: [...AUTHORING_LIFECYCLE_STATES],
    initialState: 'empty',
    terminalState: 'discarded',
    forbiddenStates: [...FORBIDDEN_LIFECYCLE_STATES],
    productionStatesAllowed: false,
    selfCertificationAllowed: false,
    emitsForbiddenState: false,
    drivesRealRuntime: false,
    stateCount: AUTHORING_LIFECYCLE_STATES.length,
    forbiddenStateCount: FORBIDDEN_LIFECYCLE_STATES.length,
  };
  return safeCloneGenericModel({ ...core, lifecycleRuntimePlanDigest: authoringPlanDigest(core) });
}

export default createLifecycleRuntimePlan;
