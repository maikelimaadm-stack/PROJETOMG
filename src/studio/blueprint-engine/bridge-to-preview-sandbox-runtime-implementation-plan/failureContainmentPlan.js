import { deepFreeze } from './deepFreeze.js';

/**
 * FAILURE CONTAINMENT PLAN — atomic, fail-closed failure behaviour for the future runtime. Declaration only.
 */
export const FAILURE_CONTAINMENT_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-failure-containment-plan',
  atomicDecision: true,
  targetNullOnBlocker: true,
  partialSandboxDescriptorAllowed: false,
  sourceMutationAllowed: false,
  sideEffectsAllowed: false,
  rollbackByNonConsumption: true,
  unexpectedExceptionFailsClosed: true,
  sanitizedEmergencyRejection: true,
  stackLeakAllowed: false,
  messageLeakAllowed: false,
  causeLeakAllowed: false,
  secretLeakAllowed: false,
  issueCode: 'RUNTIME_UNEXPECTED_EXECUTION_FAILURE',
  failureContainmentImplemented: false,
});

export default FAILURE_CONTAINMENT_PLAN;
