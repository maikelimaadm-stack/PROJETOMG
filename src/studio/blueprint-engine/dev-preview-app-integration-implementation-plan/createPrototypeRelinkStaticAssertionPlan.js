import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { FORBIDDEN_PROTOTYPE_PATHS, appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Prototype relink static-assertion PLAN — plans a static assertion that forbids relink/import/copy/
 * move of the old Studio prototype and enumerates the forbidden paths. Pure and deterministic.
 * @returns {Object}
 */
export function createPrototypeRelinkStaticAssertionPlan() {
  const core = {
    kind: 'app-integration-prototype-relink-static-assertion-plan',
    prototypeRelinkAllowed: false,
    prototypeImportAllowed: false,
    prototypeCopyAllowed: false,
    prototypeMoveAllowed: false,
    oldPrototypeImported: false,
    staticAssertionPlanned: true,
    forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
  };
  return safeCloneGenericModel({ ...core, prototypeRelinkStaticAssertionPlanDigest: appIntegrationPlanDigest(core) });
}

export default createPrototypeRelinkStaticAssertionPlan;
