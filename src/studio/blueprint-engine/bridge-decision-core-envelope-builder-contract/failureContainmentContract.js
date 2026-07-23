import { deepFreeze } from './deepFreeze.js';
/** Failure containment (declared): atomic, fail-closed, no partial core/envelope, no leak, rollback by non-emission. */
export const FAILURE_CONTAINMENT_CONTRACT = deepFreeze({
  kind: 'builder-failure-containment-contract',
  atomicBuilderDecisionRequired: true,
  partialCoreAllowed: false, partialEnvelopeAllowed: false, sourceMutationAllowed: false, sideEffectsAllowed: false,
  rollbackByNonEmission: true, unexpectedExceptionsMustFailClosed: true, emergencyRejectionRequired: true,
  stackLeakAllowed: false, internalErrorMessageLeakAllowed: false, secretLeakAllowed: false,
  issueCode: 'BUILDER_UNEXPECTED_EXECUTION_FAILURE',
});
export default FAILURE_CONTAINMENT_CONTRACT;
