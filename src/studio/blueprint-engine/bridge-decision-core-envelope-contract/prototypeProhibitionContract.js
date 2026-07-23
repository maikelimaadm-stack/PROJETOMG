import { FORBIDDEN_PROTOTYPE_PATHS } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Prototype prohibition (declared). The old Studio prototype is never imported/relinked. */
export const PROTOTYPE_PROHIBITION_CONTRACT = deepFreeze({
  kind: 'core-envelope-prototype-prohibition-contract',
  prototypeRelinkAllowed: false, oldPrototypeImported: false,
  forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
  prototypePollutionKeysRejected: true,
});
export default PROTOTYPE_PROHIBITION_CONTRACT;
