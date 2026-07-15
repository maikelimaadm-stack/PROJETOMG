import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { FORBIDDEN_PROTOTYPE_PATHS, appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Prototype relink prohibition contract — forbids relink/import/copy/move of the old Studio
 * prototype and enumerates the forbidden paths. Pure and deterministic.
 * @returns {Object}
 */
export function createPrototypeRelinkProhibitionContract() {
  const core = {
    kind: 'app-integration-prototype-relink-prohibition-contract',
    prototypeRelinkAllowed: false,
    prototypeImportAllowed: false,
    prototypeCopyAllowed: false,
    prototypeMoveAllowed: false,
    oldPrototypeImported: false,
    forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
  };
  return safeCloneGenericModel({ ...core, prototypeRelinkProhibitionDigest: appIntegrationDigest(core) });
}

export default createPrototypeRelinkProhibitionContract;
