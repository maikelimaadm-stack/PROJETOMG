import { FORBIDDEN_PROTOTYPE_PATHS } from './bridgeRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';

/** PROTOTYPE RELINK PROHIBITION — the bridge never relinks/imports/copies the old Studio prototype. */
export function createBridgePrototypeRelinkProhibition() {
  return deepFreeze({
    kind: 'bridge-prototype-relink-prohibition',
    prototypeRelinkAllowed: false,
    prototypeImportAllowed: false,
    prototypeCopyAllowed: false,
    prototypeMoveAllowed: false,
    oldPrototypeImported: false,
    forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
    forbiddenPathCount: FORBIDDEN_PROTOTYPE_PATHS.length,
  });
}

export default createBridgePrototypeRelinkProhibition;
