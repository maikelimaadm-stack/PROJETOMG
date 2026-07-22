# Envelope Input Plan

Future input: **BridgeDecisionIdentityEnvelope** (17 real fields).

- envelopeKind
- envelopeVersion
- bridgeDecisionDigest
- targetDescriptor
- sourceBridgeDecisionStatus
- sourceBridgeRuntimeVersion
- sourceBridgeContractVersion
- sourceTargetSandboxVersion
- synthetic
- immutable
- metadataOnly
- identityVerified
- sourceDecisionConsumed
- targetDescriptorConsumed
- consumerRuntimeInvoked
- previewMounted
- productExposed

Requirements:
- explicitEnvelopeRequired: true
- bridgeDecisionDigestRequired: true
- targetDescriptorRequired: true
- sameDecisionPairRequired: true
- identitySynthesisAllowed: false
- identityAliasAllowed: false
- identityFallbackAllowed: false
