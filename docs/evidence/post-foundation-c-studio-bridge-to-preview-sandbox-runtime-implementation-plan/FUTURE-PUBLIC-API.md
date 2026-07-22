# Future Public API (metadata only)

- factory: `createBridgeToPreviewSandboxRuntime(config): { execute(envelope) }`
- execute: `execute(envelope: BridgeDecisionIdentityEnvelope): ConsumerDecision`
- statuses: sandbox_candidate_accepted, sandbox_candidate_rejected

Decision shape:
- ok
- status
- envelopeAccepted
- identityVerified
- sandboxDescriptorCreated
- sandboxDescriptor
- issues
- sourceMutated
- sideEffects
- rollbackByNonConsumption
- consumerDecisionDigest

publicApiImplemented: false, executeImplemented: false, runtimeFactoryImplemented: false
