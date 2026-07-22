import { FUTURE_RUNTIME_FACTORY, CONSUMER_DECISION_STATUSES } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Declares the FUTURE public API as METADATA ONLY (signatures as strings). No function here is the real runtime
 * factory or `execute`; every implementation flag is false. The signatures describe what a SEPARATE, later,
 * authorized slice will build — this slice builds nothing executable.
 */
export const FUTURE_PUBLIC_API_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-future-public-api-plan',
  factory: deepFreeze({
    signature: `${FUTURE_RUNTIME_FACTORY}(config): { execute(envelope) }`,
    name: FUTURE_RUNTIME_FACTORY,
    input: 'config (optional, frozen)',
    output: 'runtime object exposing execute(envelope)',
    runtimeFactoryImplemented: false,
  }),
  execute: deepFreeze({
    signature: 'execute(envelope: BridgeDecisionIdentityEnvelope): ConsumerDecision',
    input: 'BridgeDecisionIdentityEnvelope',
    executeImplemented: false,
  }),
  // Future consumer decision shape — declared, NOT produced here.
  futureDecisionShape: deepFreeze([
    'ok', 'status', 'envelopeAccepted', 'identityVerified', 'sandboxDescriptorCreated', 'sandboxDescriptor',
    'issues', 'sourceMutated', 'sideEffects', 'rollbackByNonConsumption', 'consumerDecisionDigest',
  ]),
  statuses: deepFreeze([...CONSUMER_DECISION_STATUSES]),
  publicApiImplemented: false,
  executeImplemented: false,
  runtimeFactoryImplemented: false,
  envelopeBuilderImplemented: false,
  identityVerificationImplemented: false,
  mappingExecutorImplemented: false,
  sandboxDescriptorBuilderImplemented: false,
  consumerDecisionImplemented: false,
});

export default FUTURE_PUBLIC_API_PLAN;
