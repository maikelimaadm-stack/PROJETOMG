import { deepFreeze } from './deepFreeze.js';
/** Failure containment (declared): atomic, fail-closed, no partial core/envelope, no leak. */
export const FAILURE_CONTAINMENT_CONTRACT = deepFreeze({
  kind: 'core-envelope-failure-containment-contract',
  atomicEnvelopeDecisionRequired: true,
  partialCoreAllowed: false,
  partialEnvelopeAllowed: false,
  sourceMutationAllowed: false,
  sideEffectsAllowed: false,
  rollbackByNonConsumption: true,
  unexpectedExceptionsMustFailClosed: true,
  stackLeakAllowed: false,
  internalErrorMessageLeakAllowed: false,
  secretLeakAllowed: false,
  issueCode: 'CORE_ENVELOPE_UNEXPECTED_CONTRACT_FAILURE',
});
export default FAILURE_CONTAINMENT_CONTRACT;
