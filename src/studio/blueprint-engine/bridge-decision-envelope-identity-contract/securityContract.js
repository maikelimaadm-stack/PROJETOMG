import { deepFreeze } from './deepFreeze.js';
export const SECURITY_CONTRACT = deepFreeze({
  kind: 'envelope-security-contract',
  failClosed: true, anyForbiddenSideEffect: false, evalAllowed: false, dynamicCodeAllowed: false, timersAllowed: false,
  filesystemAllowed: false, networkAllowed: false, prismaAllowed: false, processEnvMutationAllowed: false,
  stackLeakAllowed: false, internalErrorMessageLeakAllowed: false, secretLeakAllowed: false,
});
export default SECURITY_CONTRACT;
