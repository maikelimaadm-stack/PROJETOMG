import { FORBIDDEN_PROTOTYPE_PATHS, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * PROTOTYPE RELINK ASSERTION PLAN — statically asserts the future bridge never relinks/imports/copies/
 * moves the old Studio prototype across the 8 forbidden path prefixes. Metadata only. @returns {Object}
 */
export function createBridgePrototypeRelinkAssertionPlan() {
  const core = {
    kind: 'bridge-prototype-relink-assertion-plan',
    prototypeRelinkAllowed: false,
    prototypeImportAllowed: false,
    prototypeCopyAllowed: false,
    prototypeMoveAllowed: false,
    oldPrototypeImported: false,
    staticAssertionPlanned: true,
    forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
    forbiddenPathCount: FORBIDDEN_PROTOTYPE_PATHS.length,
  };
  return safeCloneGenericModel({ ...core, prototypeRelinkAssertionPlanDigest: bridgePlanDigest(core) });
}

export default createBridgePrototypeRelinkAssertionPlan;
