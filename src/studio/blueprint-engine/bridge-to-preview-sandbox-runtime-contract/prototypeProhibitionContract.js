import { FORBIDDEN_PROTOTYPE_PATHS } from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
export const PROTOTYPE_PROHIBITION_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-prototype-prohibition-contract',
  oldPrototypeImported: false, prototypeRelinkAllowed: false, forbiddenPrototypePaths: [...FORBIDDEN_PROTOTYPE_PATHS],
});
export default PROTOTYPE_PROHIBITION_CONTRACT;
