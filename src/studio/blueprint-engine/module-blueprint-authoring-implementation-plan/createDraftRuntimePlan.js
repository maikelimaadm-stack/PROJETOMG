import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Draft runtime PLAN — the future runtime operates ONLY in memory on synthetic data. Metadata only.
 * @returns {Object}
 */
export function createDraftRuntimePlan() {
  const core = {
    kind: 'authoring-draft-runtime-plan',
    draftRuntimePlanned: true,
    draftRuntimeImplemented: false,
    ephemeralDraftsOnly: true,
    inMemoryOnly: true,
    syntheticDataOnly: true,
    canonicalDraftsAllowed: false,
    persistentDraftsAllowed: false,
    sideEffectsAllowed: false,
    filesystemWritesAllowed: false,
    moduleWritesAllowed: false,
  };
  return safeCloneGenericModel({ ...core, draftRuntimePlanDigest: authoringPlanDigest(core) });
}

export default createDraftRuntimePlan;
