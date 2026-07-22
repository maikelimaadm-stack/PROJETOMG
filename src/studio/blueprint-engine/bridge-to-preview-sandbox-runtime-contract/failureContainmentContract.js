import { deepFreeze } from './deepFreeze.js';
export const FAILURE_CONTAINMENT_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-failure-containment-contract',
  atomicConsumerDecisionRequired: true, partialSandboxDescriptorAllowed: false, sourceMutationAllowed: false,
  sideEffectsAllowed: false, externalCleanupRequired: false, databaseRollbackRequired: false,
  filesystemCleanupRequired: false, rollbackByNonConsumption: true, unexpectedExceptionsMustFailClosed: true,
  stackLeakAllowed: false, internalErrorMessageLeakAllowed: false, secretLeakAllowed: false,
});
export default FAILURE_CONTAINMENT_CONTRACT;
