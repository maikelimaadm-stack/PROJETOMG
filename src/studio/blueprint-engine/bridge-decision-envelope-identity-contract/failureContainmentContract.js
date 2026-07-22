import { deepFreeze } from './deepFreeze.js';
export const FAILURE_CONTAINMENT_CONTRACT = deepFreeze({
  kind: 'envelope-failure-containment-contract',
  atomicEnvelopeDecisionRequired: true, partialEnvelopeAllowed: false, sourceMutationAllowed: false, sideEffectsAllowed: false,
  rollbackByNonConsumption: true, unexpectedExceptionsMustFailClosed: true, stackLeakAllowed: false,
  internalErrorMessageLeakAllowed: false, secretLeakAllowed: false,
});
export default FAILURE_CONTAINMENT_CONTRACT;
