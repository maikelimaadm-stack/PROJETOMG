import { deepFreeze } from './deepFreeze.js';
/**
 * Identity/provenance contract. The bridge DECISION carries bridgeDecisionDigest, but the target DESCRIPTOR
 * itself does NOT — so consumption of the descriptor alone lacks the source bridge decision digest; that is
 * declared a FUTURE-IMPLEMENTATION BLOCKER (the future consumer must receive it explicitly, never synthesize it).
 */
export const IDENTITY_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-identity-contract',
  explicitSourceDescriptorRequired: true,
  sourceDescriptorIdentityRequired: true,
  sourceBridgeDecisionDigestRequired: true,
  sourceBridgeContractVersionRequired: true,
  sourceBridgeRuntimeVersionRequired: true,
  sourceSandboxContractVersionRequired: true,
  sourceDescriptorIdentityFields: ['candidateDraftId', 'candidateDraftRevision', 'candidateDraftDigest', 'sourceDigest'],
  // The target descriptor does not carry its own bridge decision digest.
  bridgeDecisionDigestPresentOnTargetDescriptor: false,
  declareMissingIdentityAsFutureImplementationBlocker: true,
  doNotSynthesizeDefault: true, doNotInventAlias: true, doNotAuthorizeImplementation: true,
  distinctIdentities: ['source_bridge_decision_identity', 'target_descriptor_identity', 'future_consumer_decision_identity'],
});
export default IDENTITY_CONTRACT;
