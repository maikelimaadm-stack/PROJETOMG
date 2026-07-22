# Consumer Decision Plan

Fields:
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

- serializer: stableSerialize (key-sorted, deterministic) — read-only reuse of Authoring Runtime helper
- digest: createDeterministicDigest (FNV-1a) — internal identity only
- cryptographicSecurityClaimed: false
