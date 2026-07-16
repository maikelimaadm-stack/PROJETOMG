import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { FORBIDDEN_PROTOTYPE_PATHS, authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * Prototype relink prohibition contract — forbids relink/import/copy/move of the old Studio prototype
 * and enumerates the forbidden paths. This authoring foundation is built fresh; it never reuses,
 * imports, or relinks the old Studio prototype. Pure and deterministic.
 * @returns {Object}
 */
export function createPrototypeRelinkProhibitionContract() {
  const core = {
    kind: 'authoring-prototype-relink-prohibition-contract',
    prototypeRelinkAllowed: false,
    prototypeImportAllowed: false,
    prototypeCopyAllowed: false,
    prototypeMoveAllowed: false,
    oldPrototypeImported: false,
    forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
    forbiddenPathCount: FORBIDDEN_PROTOTYPE_PATHS.length,
  };
  return safeCloneGenericModel({ ...core, prototypeRelinkProhibitionDigest: authoringFoundationDigest(core) });
}

export default createPrototypeRelinkProhibitionContract;
