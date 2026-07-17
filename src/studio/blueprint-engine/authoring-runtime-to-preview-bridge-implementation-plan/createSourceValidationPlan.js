import { CRITICAL_SOURCE_FIELDS, SOURCE_BOUNDARY_FIELDS, SOURCE_HANDOFF_KIND, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * SOURCE VALIDATION PLAN — plans (does not implement) strict shape validation of the future
 * synthetic_preview_candidate handoff. Metadata only. @returns {Object}
 */
export function createSourceValidationPlan() {
  const core = {
    kind: 'bridge-source-validation-plan',
    handoffKind: SOURCE_HANDOFF_KIND,
    criticalFields: [...CRITICAL_SOURCE_FIELDS],
    criticalFieldCount: CRITICAL_SOURCE_FIELDS.length,
    boundaryFields: [...SOURCE_BOUNDARY_FIELDS],
    expected: {
      synthetic: true, immutable: true, validated: true, previewMounted: false,
      realDataAttached: false, routeCreated: false, menuCreated: false, productExposed: false,
    },
    sourceValidationPlanned: true,
    sourceValidationImplemented: false,
    strictSourceShape: true,
    unknownCriticalFieldsRejected: true,
    missingCriticalFieldsFailClosed: true,
    sourceValidationSideEffectsAllowed: false,
  };
  return safeCloneGenericModel({ ...core, sourceValidationPlanDigest: bridgePlanDigest(core) });
}

export default createSourceValidationPlan;
