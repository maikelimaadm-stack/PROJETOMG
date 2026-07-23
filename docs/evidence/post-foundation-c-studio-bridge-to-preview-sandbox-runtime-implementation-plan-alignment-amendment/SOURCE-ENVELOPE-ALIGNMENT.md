# Source Envelope Alignment

futureInputName: BridgeDecisionCoreEnvelope

Fields:
- envelopeKind
- envelopeVersion
- bridgeDecisionDigest
- bridgeDecisionCore
- synthetic
- immutable
- metadataOnly
- identityVerified
- coreConsumed
- consumerRuntimeInvoked
- previewMounted
- productExposed

Requirements:
- explicitCoreEnvelopeRequired: true
- bridgeDecisionDigestRequired: true
- bridgeDecisionCoreRequired: true
- fullPreimageRequired: true
- sameDecisionPairRequired: true
- v1RuntimeInputAllowed: false
- implicitV1ToV2UpgradeAllowed: false
- identitySynthesisAllowed: false
- coreSynthesisAllowed: false
- identityAliasAllowed: false
- identityFallbackAllowed: false
