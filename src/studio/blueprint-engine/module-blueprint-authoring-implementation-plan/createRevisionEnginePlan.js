import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Revision engine PLAN — plans deterministic, monotonic, in-memory revisions starting at 0, with no
 * persistence and no in-place canonical mutation. Metadata only.
 * @returns {Object}
 */
export function createRevisionEnginePlan() {
  const core = {
    kind: 'authoring-revision-engine-plan',
    revisionEnginePlanned: true,
    revisionEngineImplemented: false,
    revisionStartsAt: 0,
    revisionMonotonic: true,
    negativeRevisionAllowed: false,
    inPlaceCanonicalMutationAllowed: false,
    historyPersistenceAllowed: false,
    inMemoryOnly: true,
  };
  return safeCloneGenericModel({ ...core, revisionEnginePlanDigest: authoringPlanDigest(core) });
}

export default createRevisionEnginePlan;
