import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { FORBIDDEN_PROTOTYPE_PATHS, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Prototype relink static-assertion PLAN — plans a static assertion that the future runtime imports
 * none of the old Studio prototype paths. This slice relinks nothing. Metadata only.
 * @returns {Object}
 */
export function createPrototypeRelinkStaticAssertionPlan() {
  const core = {
    kind: 'authoring-prototype-relink-static-assertion-plan',
    prototypeRelinkStaticAssertionPlanned: true,
    prototypeRelinkAllowed: false,
    prototypeImportAllowed: false,
    prototypeCopyAllowed: false,
    prototypeMoveAllowed: false,
    oldPrototypeImported: false,
    staticImportAssertionRequired: true,
    forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
    forbiddenPathCount: FORBIDDEN_PROTOTYPE_PATHS.length,
  };
  return safeCloneGenericModel({ ...core, prototypeRelinkStaticAssertionPlanDigest: authoringPlanDigest(core) });
}

export default createPrototypeRelinkStaticAssertionPlan;
