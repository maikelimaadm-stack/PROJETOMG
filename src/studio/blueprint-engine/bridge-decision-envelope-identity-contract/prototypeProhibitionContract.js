import { FORBIDDEN_PROTOTYPE_PATHS } from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
export const PROTOTYPE_PROHIBITION_CONTRACT = deepFreeze({
  kind: 'envelope-prototype-prohibition-contract',
  oldPrototypeImported: false, prototypeRelinkAllowed: false, forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
});
export default PROTOTYPE_PROHIBITION_CONTRACT;
