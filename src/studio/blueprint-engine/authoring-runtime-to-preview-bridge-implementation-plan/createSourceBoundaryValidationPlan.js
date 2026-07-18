import { SOURCE_BOUNDARY_FIELDS, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * SOURCE SYNTHETIC / SSOT BOUNDARY VALIDATION PLAN — plans validation that the source handoff is
 * synthetic and stays within SSOT boundaries: not mounted, no real data, no route/menu, not product-
 * exposed, and never canonical/certified. Metadata only. @returns {Object}
 */
export function createSourceBoundaryValidationPlan() {
  const core = {
    kind: 'bridge-source-boundary-validation-plan',
    sourceBoundaryValidationPlanned: true,
    sourceBoundaryValidationImplemented: false,
    boundaryFields: [...SOURCE_BOUNDARY_FIELDS],
    requiresSyntheticTrue: true,
    requiresValidatedTrue: true,
    requiresImmutableTrue: true,
    rejectsPreviewMounted: true,
    rejectsRealDataAttached: true,
    rejectsRouteCreated: true,
    rejectsMenuCreated: true,
    rejectsProductExposed: true,
    rejectsCanonicalSource: true,
    rejectsCertifiedSource: true,
    certifiedBlueprintRemainsSsot: true,
  };
  return safeCloneGenericModel({ ...core, sourceBoundaryValidationPlanDigest: bridgePlanDigest(core) });
}

export default createSourceBoundaryValidationPlan;
