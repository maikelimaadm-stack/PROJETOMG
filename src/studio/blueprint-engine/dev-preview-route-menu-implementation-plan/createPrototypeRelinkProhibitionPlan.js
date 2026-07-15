import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { FORBIDDEN_PROTOTYPE_PATHS, routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Prototype relink prohibition PLAN — explicitly forbids importing/relinking/copying/moving the
 * old Studio prototype. Pure and deterministic.
 * @returns {Object}
 */
export function createPrototypeRelinkProhibitionPlan() {
  const core = {
    kind: 'route-menu-prototype-relink-prohibition-plan',
    prototypeRelinkAllowed: false,
    prototypeImportAllowed: false,
    prototypeCopyAllowed: false,
    prototypeMoveAllowed: false,
    forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
    oldPrototypeImported: false,
  };
  return safeCloneGenericModel({ ...core, prototypeRelinkProhibitionDigest: routeMenuPlanDigest(core) });
}

export default createPrototypeRelinkProhibitionPlan;
