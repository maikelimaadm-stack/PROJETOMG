import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * Declares the isolation boundary the runtime UI proves. Every flag asserts a forbidden wiring /
 * mount / import stays off. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createRuntimeUiIsolationBoundary() {
  const core = {
    kind: 'runtime-ui-isolation-boundary',
    appWired: false,
    routeWired: false,
    menuWired: false,
    moduleWired: false,
    backendAccessed: false,
    prismaAccessed: false,
    realDataAccessed: false,
    productionAccessed: false,
    stagingAccessed: false,
    oldPrototypeImported: false,
    reactDomUsed: false,
    createRootUsed: false,
    domGlobalsUsed: false,
    componentsImported: false,
    pagesImported: false,
    confinedToAuthorizedSubtree: true,
    reversibleByNonConsumption: true,
  };
  return safeCloneGenericModel({ ...core, isolationBoundaryDigest: runtimeUiDigest(core) });
}

export default createRuntimeUiIsolationBoundary;
