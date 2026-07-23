import { FORBIDDEN_PROTOTYPE_PATHS, FORBIDDEN_PROTOTYPE_KEYS } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Prototype prohibition (declared). Old Studio prototype never imported/relinked. */
export const PROTOTYPE_RELINK_PROHIBITION = deepFreeze({
  kind: 'builder-prototype-relink-prohibition',
  prototypeRelinkAllowed: false, oldPrototypeImported: false,
  forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
  forbiddenPrototypeKeys: [...FORBIDDEN_PROTOTYPE_KEYS],
  prototypePollutionKeysRejected: true,
});
export default PROTOTYPE_RELINK_PROHIBITION;
