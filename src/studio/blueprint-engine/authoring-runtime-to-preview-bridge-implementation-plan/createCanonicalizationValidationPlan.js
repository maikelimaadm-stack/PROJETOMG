import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * CANONICALIZATION VALIDATION PLAN — plans stable, key-ordered, array-order-preserving, locale/timezone-
 * independent serialization; ambient clock and randomness forbidden. Not implemented here. @returns {Object}
 */
export function createCanonicalizationValidationPlan() {
  const core = {
    kind: 'bridge-canonicalization-validation-plan',
    canonicalizationValidationPlanned: true,
    canonicalizationValidationImplemented: false,
    stableSerializationRequired: true,
    keyOrderingRequired: true,
    arrayOrderingPreserved: true,
    localeIndependent: true,
    timezoneIndependent: true,
    ambientClockForbidden: true,
    randomnessForbidden: true,
  };
  return safeCloneGenericModel({ ...core, canonicalizationValidationPlanDigest: bridgePlanDigest(core) });
}

export default createCanonicalizationValidationPlan;
