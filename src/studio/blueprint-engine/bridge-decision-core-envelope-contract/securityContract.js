import { deepFreeze } from './deepFreeze.js';
/** Security boundary (declared). No forbidden side effect; contract-only. */
export const SECURITY_CONTRACT = deepFreeze({
  kind: 'core-envelope-security-contract',
  anyForbiddenSideEffect: false,
  certifyAllowed: false, publishAllowed: false, registerAllowed: false, moduleGenerationAllowed: false,
  productExposureAllowed: false, realDataReadAllowed: false, realDataWriteAllowed: false,
  networkAllowed: false, backendAllowed: false, prismaAllowed: false,
});
export default SECURITY_CONTRACT;
