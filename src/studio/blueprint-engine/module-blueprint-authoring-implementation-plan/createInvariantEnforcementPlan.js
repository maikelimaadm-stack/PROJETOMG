import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_INVARIANT_IDS, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Invariant enforcement PLAN — plans fail-closed enforcement of every structural invariant in a
 * future runtime. This layer enforces nothing. Metadata only.
 * @returns {Object}
 */
export function createInvariantEnforcementPlan() {
  const invariants = AUTHORING_INVARIANT_IDS.map((id) => ({ invariantId: id, planned: true, implemented: false, failClosed: true }));
  const core = {
    kind: 'authoring-invariant-enforcement-plan',
    invariantEnforcementPlanned: true,
    invariantEnforcementImplemented: false,
    allInvariantsFailClosed: true,
    invariants,
    invariantIds: [...AUTHORING_INVARIANT_IDS],
    invariantCount: invariants.length,
  };
  return safeCloneGenericModel({ ...core, invariantEnforcementPlanDigest: authoringPlanDigest(core) });
}

export default createInvariantEnforcementPlan;
