import { FORBIDDEN_PROTOTYPE_PATHS, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/** Prototype relink prohibition — forbids relink/import/copy/move of the old Studio prototype. Pure. */
export function createBridgePrototypeRelinkProhibitionContract() {
  const core = {
    kind: 'bridge-prototype-relink-prohibition-contract',
    prototypeRelinkAllowed: false,
    prototypeImportAllowed: false,
    prototypeCopyAllowed: false,
    prototypeMoveAllowed: false,
    oldPrototypeImported: false,
    forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
    forbiddenPathCount: FORBIDDEN_PROTOTYPE_PATHS.length,
  };
  return safeCloneGenericModel({ ...core, prototypeRelinkProhibitionContractDigest: bridgeDigest(core) });
}

export default createBridgePrototypeRelinkProhibitionContract;
